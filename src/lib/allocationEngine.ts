import { supabase } from '../supabaseClient';

// Helper to resolve day of week from YYYY-MM-DD DATE string
const getDayOfWeek = (dateString: string): 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | null => {
  if (!dateString) return null;
  const parts = dateString.split('-');
  if (parts.length !== 3) return null;
  const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const dayIndex = date.getDay();
  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
  ];
  if (dayIndex >= 1 && dayIndex <= 5) {
    return days[dayIndex - 1];
  }
  return null;
};

/**
 * Automatically allocates substitute faculty members for an approved leave request.
 * @param leaveRequestId - The numeric ID of the approved leave request.
 */
export const allocateSubstitutesForLeave = async (leaveRequestId: number) => {
  if (!supabase) {
    return { success: true, count: 0, message: 'Supabase bypass (Mock Mode)' };
  }

  try {
    // 1. Fetch Leave Details
    const { data: leave, error: leaveErr } = await supabase
      .from('leave_requests')
      .select('faculty_id, start_date, end_date')
      .eq('id', leaveRequestId)
      .single();

    if (leaveErr || !leave) {
      return { success: false, error: leaveErr?.message || 'Leave request not found' };
    }

    const { faculty_id: facultyId, start_date: startDateStr, end_date: endDateStr } = leave;

    // Fetch original absent faculty profile to match departments and specializations
    const { data: absentFaculty, error: facultyErr } = await supabase
      .from('faculty')
      .select('*')
      .eq('id', facultyId)
      .single();

    if (facultyErr || !absentFaculty) {
      return { success: false, error: facultyErr?.message || 'Absent faculty record not found' };
    }

    // Fetch all active faculty members to evaluate as candidates
    const { data: allFaculty, error: allFacultyErr } = await supabase
      .from('faculty')
      .select('*');

    if (allFacultyErr || !allFaculty) {
      return { success: false, error: allFacultyErr?.message || 'Failed to retrieve faculty directory' };
    }

    // Fetch all approved leaves covering overlapping timelines
    const { data: allApprovedLeaves, error: leavesErr } = await supabase
      .from('leave_requests')
      .select('faculty_id, start_date, end_date')
      .eq('status', 'Approved');

    if (leavesErr) {
      return { success: false, error: leavesErr.message };
    }

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const newRequests: any[] = [];
    const newFreePeriods: any[] = [];

    // 2. Loop through every date in the leave range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = getDayOfWeek(dateStr);
      if (!dayOfWeek) continue; // Skip weekends

      // Query class_timetable for slots assigned to the absent teacher on this day of the week
      const { data: slots, error: slotsErr } = await supabase
        .from('class_timetable')
        .select('*')
        .eq('faculty_id', facultyId)
        .eq('day_of_week', dayOfWeek);

      if (slotsErr || !slots || slots.length === 0) continue;

      // 3. For each scheduled slot, query availability and select a substitute
      for (const slot of slots) {
        // Exclude faculty members who are already teaching this period
        const { data: busyTeaching, error: busyTeachingErr } = await supabase
          .from('class_timetable')
          .select('faculty_id')
          .eq('day_of_week', dayOfWeek)
          .eq('period', slot.period);

        if (busyTeachingErr) continue;

        // Exclude faculty members who are already allocated to substitute this period
        const { data: busySubbing, error: busySubbingErr } = await supabase
          .from('substitute_allocations')
          .select('substitute_faculty_id')
          .eq('date', dateStr)
          .eq('period', slot.period);

        if (busySubbingErr) continue;

        const busyIds = new Set<string>();
        // The absent teacher themselves is busy
        busyIds.add(facultyId);

        busyTeaching?.forEach(item => {
          if (item.faculty_id) busyIds.add(item.faculty_id);
        });

        busySubbing?.forEach(item => {
          if (item.substitute_faculty_id) busyIds.add(item.substitute_faculty_id);
        });

        // Exclude faculty members on approved leave covering this date
        const onLeaveIds = new Set<string>();
        allApprovedLeaves?.forEach(l => {
          if (dateStr >= l.start_date && dateStr <= l.end_date) {
            onLeaveIds.add(l.faculty_id);
          }
        });

        // Filter candidate faculty members
        const candidates = allFaculty.filter(f => {
          if (f.is_admin) return false;
          if (busyIds.has(f.id)) return false;
          if (onLeaveIds.has(f.id)) return false;
          return true;
        });

        // 4. Apply Smart Ranking criteria
        const rankedCandidates = candidates.map(c => {
          const deptMatches = c.department === absentFaculty.department;
          const specMatches = c.specialization?.toLowerCase() === slot.subject?.toLowerCase();

          let score = 0;
          if (deptMatches && specMatches) score = 3;
          else if (deptMatches) score = 2;
          else if (specMatches) score = 1;

          return { candidate: c, score };
        });

        // Sort descending by priority score
        rankedCandidates.sort((a, b) => b.score - a.score);

        const substituteId = rankedCandidates.length > 0 ? rankedCandidates[0].candidate.id : null;

        if (substituteId) {
          newRequests.push({
            leave_request_id: leaveRequestId,
            date: dateStr,
            period: slot.period,
            class_name: slot.class_name,
            subject: slot.subject,
            substitute_faculty_id: substituteId,
            status: 'Pending'
          });
        } else {
          newFreePeriods.push({
            leave_request_id: leaveRequestId,
            date: dateStr,
            period: slot.period,
            class_name: slot.class_name,
            original_faculty_id: facultyId,
            substitute_faculty_id: null
          });
        }
      }
    }

    // 5. Commit to database
    if (newRequests.length > 0) {
      const { error: insertErr } = await supabase
        .from('substitution_requests')
        .insert(newRequests);

      if (insertErr) {
        return { success: false, error: insertErr.message };
      }
    }

    if (newFreePeriods.length > 0) {
      const { error: insertErr } = await supabase
        .from('substitute_allocations')
        .insert(newFreePeriods);

      if (insertErr) {
        return { success: false, error: insertErr.message };
      }
    }

    return { success: true, count: newRequests.length + newFreePeriods.length };
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected allocation engine error occurred' };
  }
};

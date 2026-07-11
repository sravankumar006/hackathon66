import { supabase } from '../supabaseClient';

export const submitLeaveRequest = async (facultyId: string, startDate: string, endDate: string, reason: string) => {
  if (!supabase) return { error: 'Supabase not configured' };
  
  const { data, error } = await supabase
    .from('leave_requests')
    .insert([{
      faculty_id: facultyId,
      start_date: startDate,
      end_date: endDate,
      reason,
      status: 'Pending'
    }])
    .select()
    .single();
    
  return { data, error };
};

export const cancelLeaveRequest = async (leaveId: number) => {
  if (!supabase) return { error: 'Supabase not configured' };
  
  const { error } = await supabase
    .from('leave_requests')
    .delete()
    .eq('id', leaveId);
    
  return { error };
};

export const getPendingSwapsForUser = async (facultyId: string) => {
  if (!supabase) return { data: null, error: 'Supabase not configured' };
  
  const { data, error } = await supabase
    .from('hour_swaps')
    .select('*')
    .or(`requester_id.eq.${facultyId},target_faculty_id.eq.${facultyId}`)
    .in('status', ['PendingReceiver', 'PendingAdmin']); 
    
  return { data, error };
};

export const getDynamicTimetable = async (targetDate: string, type: 'class' | 'faculty', targetId: string) => {
  if (!supabase) return { data: null, error: 'Supabase not configured' };
  
  const dayName = new Date(targetDate).toLocaleDateString('en-US', { weekday: 'long' });

  // 1. Get base timetable for that day
  let ttQuery = supabase.from('class_timetable').select('*').eq('day_of_week', dayName);
  
  if (type === 'faculty') {
    ttQuery = ttQuery.eq('faculty_id', targetId);
  } else if (type === 'class') {
    ttQuery = ttQuery.eq('class_name', targetId);
  }

  const { data: ttData, error: ttError } = await ttQuery;
  
  if (ttError) return { data: null, error: ttError };

  // 2. Get allocations for that day
  const { data: allocData, error: allocError } = await supabase
    .from('substitute_allocations')
    .select('*')
    .eq('date', targetDate);

  if (allocError) return { data: null, error: allocError };

  // Combine and override faculty_id
  const dynamicTimetable = ttData.map((slot: any) => {
    const allocation = allocData.find((a: any) => a.period === slot.period && a.original_faculty_id === slot.faculty_id);
    if (allocation) {
      return {
        id: String(slot.id),
        day: slot.day_of_week,
        period: slot.period,
        class_name: slot.class_name,
        subject: slot.subject,
        faculty_id: allocation.substitute_faculty_id, // could be null if free period
        is_substitute: true
      };
    }
    return { 
      id: String(slot.id),
      day: slot.day_of_week,
      period: slot.period,
      class_name: slot.class_name,
      subject: slot.subject,
      faculty_id: slot.faculty_id,
      is_substitute: false 
    };
  });

  return { data: dynamicTimetable, error: null };
};

export const updateLeaveStatus = async (leaveRequestId: number, newStatus: 'Approved' | 'Rejected') => {
  if (!supabase) return { success: true, error: null };
  
  const { error } = await supabase
    .from('leave_requests')
    .update({ status: newStatus })
    .eq('id', leaveRequestId);
    
  return { success: !error, error: error?.message || null };
};

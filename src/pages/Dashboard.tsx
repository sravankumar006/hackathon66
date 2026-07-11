import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useSystem, getDayOfWeek } from '../context/SystemContext';
import { 
  Calendar, 
  BookOpen, 
  Check, 
  X, 
  AlertTriangle, 
  Send, 
  FileText,
  Shield,
  Bell,
  ArrowRight,
  UserCheck
} from 'lucide-react';


export const Dashboard: React.FC = () => {
  const { 
    faculties, 
    timetable, 
    leaveRequests, 
    substituteAllocations, 
    swapRequests, 
    substitutionRequests,
    eventLogs,
    currentFaculty,
    setCurrentPage,
    setActiveLeaveTab,
    approveLeaveRequest,
    rejectLeaveRequest,
    respondToSwap,
    approveSwap,
    rejectSwap,
    acceptSubstitutionRequest,
    declineSubstitutionRequest
  } = useSystem();

  // Selected date defaults to 2026-07-13 (Monday — matches our seed data day)
  const [selectedDate, setSelectedDate] = useState('2026-07-13');
  const [activeTimetableSlots, setActiveTimetableSlots] = useState<typeof timetable>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);

  const dayOfWeek = getDayOfWeek(selectedDate);

  // Re-fetch timetable slots from DB whenever date or faculty changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!currentFaculty || !supabase || !dayOfWeek) {
        setActiveTimetableSlots([]);
        return;
      }
      setIsFetchingSlots(true);
      const { data } = await supabase
        .from('class_timetable')
        .select('*')
        .eq('faculty_id', currentFaculty.id)
        .eq('day_of_week', dayOfWeek);
      if (data) {
        setActiveTimetableSlots(data.map((t: any) => ({
          id: String(t.id),
          day: t.day_of_week,
          period: t.period,
          class_name: t.class_name,
          subject: t.subject,
          faculty_id: t.faculty_id
        })));
      } else {
        setActiveTimetableSlots([]);
      }
      setIsFetchingSlots(false);
    };
    fetchSlots();
  }, [selectedDate, currentFaculty?.id, dayOfWeek]);

  // Filter lists based on role and selected date

  // Active leaves on selectedDate
  const activeLeavesToday = leaveRequests.filter(l => 
    l.status === 'Approved' && 
    selectedDate >= l.start_date && 
    selectedDate <= l.end_date
  );

  // Unallocated alerts for selectedDate (Free Periods)
  const unallocatedSlotsToday = substituteAllocations.filter(a => 
    a.date === selectedDate && 
    a.substitute_faculty_id === null
  );

  // Quick redirection from daily schedule to Leaves page
  const handleQuickSwap = () => {
    setCurrentPage('leaves');
  };

  // 1. ADMIN VIEW COMPONENT
  const AdminDashboard = () => {
    const pendingLeaves = leaveRequests.filter(l => l.status === 'Pending');
    const pendingSwaps = swapRequests.filter(s => s.status === 'PendingAdmin');

    return (
      <div className="space-y-6">
        {/* Quick Diagnostic Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Leaves Stats */}
          <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Campus Leaves Today</span>
              <h3 className="text-2xl font-black text-slate-100">{activeLeavesToday.length}</h3>
              <p className="text-[10px] text-slate-500 mt-1">Approved absences</p>
            </div>
            <div className="p-3 bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Pending Approvals</span>
              <h3 className="text-2xl font-black text-slate-100">{pendingLeaves.length + pendingSwaps.length}</h3>
              <p className="text-[10px] text-slate-500 mt-1">{pendingLeaves.length} leaves, {pendingSwaps.length} swaps</p>
            </div>
            <div className="p-3 bg-purple-500/5 text-purple-400 border border-purple-500/10 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
          </div>

          {/* Unallocated alert */}
          <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Unallocated Free Periods</span>
              <h3 className={`text-2xl font-black ${unallocatedSlotsToday.length > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                {unallocatedSlotsToday.length}
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">Requires substitute cover</p>
            </div>
            <div className={`p-3 rounded-xl border ${
              unallocatedSlotsToday.length > 0 
                ? 'bg-amber-500/5 text-amber-500 border-amber-500/10 animate-pulse' 
                : 'bg-slate-950 text-slate-600 border-slate-850'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Core Administrative queues */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leaves approval queue */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl flex flex-col">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-4 flex items-center">
              <FileText className="w-4 h-4 text-indigo-400 mr-2" />
              Leave Approvals Queue
            </h3>
            {pendingLeaves.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center py-10 border border-dashed border-slate-850 rounded-lg text-slate-550 text-xs">
                <Check className="w-8 h-8 text-slate-700 mb-2" />
                No pending leave requests.
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {pendingLeaves.map(l => {
                  const faculty = faculties.find(f => f.id === l.faculty_id);
                  return (
                    <div key={l.id} className="p-4 bg-slate-950 border border-slate-850 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-200">{faculty?.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-slate-900 border border-slate-800 text-slate-400 rounded">
                            {faculty?.dept}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                          Dates: <span className="text-slate-350">{l.start_date}</span> to <span className="text-slate-350">{l.end_date}</span>
                        </p>
                        <p className="text-[11px] text-indigo-300 mt-1 italic">" {l.reason} "</p>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => approveLeaveRequest(l.id)}
                          className="p-1.5 bg-emerald-650 hover:bg-emerald-700 text-emerald-50 rounded-lg flex items-center justify-center transition"
                          title="Approve Leave"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => rejectLeaveRequest(l.id)}
                          className="p-1.5 bg-red-650 hover:bg-red-750 text-red-50 rounded-lg flex items-center justify-center transition"
                          title="Reject Leave"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Peer Swaps approval queue */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl flex flex-col">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-4 flex items-center">
              <UserCheck className="w-4 h-4 text-indigo-400 mr-2" />
              Swap Approvals Queue (Pending Admin)
            </h3>
            {pendingSwaps.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center py-10 border border-dashed border-slate-850 rounded-lg text-slate-550 text-xs">
                <Check className="w-8 h-8 text-slate-700 mb-2" />
                No pending swaps requiring approval.
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {pendingSwaps.map(s => {
                  const requester = faculties.find(f => f.id === s.requester_faculty_id);
                  const receiver = faculties.find(f => f.id === s.receiver_faculty_id);
                  return (
                    <div key={s.id} className="p-4 bg-slate-950 border border-slate-850 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
                      <div>
                        <div className="flex items-center space-x-1.5 text-xs text-slate-350 font-semibold">
                          <span className="text-slate-200 font-bold">{requester?.name}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-550" />
                          <span className="text-indigo-400 font-bold">{receiver?.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-550 mt-1">
                          Date: <span className="text-slate-350">{s.date}</span> | Period: <span className="text-slate-350">{s.period}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Class: <span className="font-bold">{s.class_name}</span> ({s.subject})
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => approveSwap(s.id)}
                          className="p-1.5 bg-indigo-600 hover:bg-indigo-750 text-indigo-50 rounded-lg flex items-center justify-center transition"
                          title="Approve Swap"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => rejectSwap(s.id)}
                          className="p-1.5 bg-red-650 hover:bg-red-750 text-red-50 rounded-lg flex items-center justify-center transition"
                          title="Reject Swap"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Grid: Campus Leave directory & Free period details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Campus Leaves Today */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl text-left lg:col-span-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-3.5">
              Approved Absences Today ({selectedDate})
            </h3>
            {activeLeavesToday.length === 0 ? (
              <div className="py-8 border border-dashed border-slate-850 rounded-lg text-center text-slate-550 text-xs">
                No faculty members are approved for leave on this date.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-500">
                      <th className="py-2 pb-3">Faculty</th>
                      <th className="py-2 pb-3">Department</th>
                      <th className="py-2 pb-3">Date Range</th>
                      <th className="py-2 pb-3">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/40">
                    {activeLeavesToday.map(l => {
                      const fac = faculties.find(f => f.id === l.faculty_id);
                      return (
                        <tr key={l.id} className="text-slate-300">
                          <td className="py-2.5 font-bold">{fac?.name}</td>
                          <td className="py-2.5 text-slate-450">{fac?.dept}</td>
                          <td className="py-2.5 font-mono text-[10px]">{l.start_date} to {l.end_date}</td>
                          <td className="py-2.5 italic text-indigo-400">"{l.reason}"</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Unallocated Slot Warnings Detail */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl text-left">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-3.5 flex items-center">
              <AlertTriangle className="w-4 h-4 text-amber-500 mr-2 animate-pulse" />
              Unassigned Alerts
            </h3>
            {unallocatedSlotsToday.length === 0 ? (
              <div className="py-8 border border-dashed border-slate-850 rounded-lg text-center text-slate-550 text-xs">
                All absent slots successfully covered!
              </div>
            ) : (
              <div className="space-y-3.5">
                {unallocatedSlotsToday.map(a => {
                  const orig = faculties.find(f => f.id === a.original_faculty_id);
                  // Find matching slot details in timetable
                  const ttSlot = timetable.find(t => t.faculty_id === a.original_faculty_id && t.period === a.period && t.day === dayOfWeek);
                  return (
                    <div key={a.id} className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg text-xs">
                      <span className="font-bold text-amber-500 uppercase tracking-widest text-[9px] block mb-1">Free Period Alert</span>
                      <p className="font-bold text-slate-200">{ttSlot?.class_name || 'Class Slot'}</p>
                      <p className="text-[10px] text-slate-450 mt-0.5">Subject: {ttSlot?.subject || 'N/A'}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Original Faculty: {orig?.name}</p>
                      <p className="text-[10px] text-slate-550 mt-1">Period: {a.period} (No substitute found)</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 2. FACULTY VIEW COMPONENT
  const FacultyDashboard = () => {
    if (!currentFaculty) return null;

    // A. Daily schedule for currentFaculty on selectedDate
    // Use activeTimetableSlots (directly fetched from DB on date change) with
    // a fallback to the global in-memory timetable for substitution lookups.
    const regularSlots = activeTimetableSlots.length > 0
      ? activeTimetableSlots
      : timetable.filter(t => t.faculty_id === currentFaculty.id && t.day === dayOfWeek);
    
    // Check for substitutions or swaps for currentFaculty on this day
    const schedule = [1, 2, 3, 4, 5].map(p => {
      // 1. Is the current faculty on approved leave today?
      const isFacultyOnLeave = leaveRequests.some(l => 
        l.faculty_id === currentFaculty.id && 
        l.status === 'Approved' && 
        selectedDate >= l.start_date && 
        selectedDate <= l.end_date
      );

      // 2. Check if there is an allocation for this day/period replacing the current faculty
      const replacedAllocation = substituteAllocations.find(a => 
        a.date === selectedDate && 
        a.period === p && 
        a.original_faculty_id === currentFaculty.id
      );

      // 3. Check if the current faculty is assigned as a substitute for another faculty's slot
      const subbingAllocation = substituteAllocations.find(a => 
        a.date === selectedDate && 
        a.period === p && 
        a.substitute_faculty_id === currentFaculty.id
      );

      // 4. Regular timetable slot details
      const regSlot = regularSlots.find(s => s.period === p);

      let status = 'Normal'; // Normal, Covered, Free, Subbing, Leave
      let details = regSlot ? { class_name: regSlot.class_name, subject: regSlot.subject, original_name: 'Me' } : null;

      if (isFacultyOnLeave) {
        status = 'Leave';
        if (replacedAllocation) {
          const subFac = faculties.find(f => f.id === replacedAllocation.substitute_faculty_id);
          status = replacedAllocation.substitute_faculty_id ? 'Covered' : 'Free';
          details = regSlot ? { 
            class_name: regSlot.class_name, 
            subject: regSlot.subject, 
            original_name: subFac ? subFac.name : 'Unassigned (Free Period)' 
          } : null;
        }
      } else if (replacedAllocation) {
        // Leave or Swap coverage replacement
        const subFac = faculties.find(f => f.id === replacedAllocation.substitute_faculty_id);
        status = replacedAllocation.substitute_faculty_id ? 'Covered' : 'Free';
        details = regSlot ? { 
          class_name: regSlot.class_name, 
          subject: regSlot.subject, 
          original_name: subFac ? subFac.name : 'Unassigned (Free Period)' 
        } : null;
      } else if (subbingAllocation) {
        // Faculty is covering for someone else!
        const origFaculty = faculties.find(f => f.id === subbingAllocation.original_faculty_id);
        // Find slot details from original faculty's timetable
        const origSlot = timetable.find(t => t.faculty_id === subbingAllocation.original_faculty_id && t.period === p && t.day === dayOfWeek);
        status = 'Subbing';
        details = origSlot ? {
          class_name: origSlot.class_name,
          subject: origSlot.subject,
          original_name: origFaculty ? origFaculty.name : 'N/A'
        } : null;
      }

      return { period: p, status, details };
    });

    // B. Received swap requests
    const receivedSwaps = swapRequests.filter(s => s.receiver_faculty_id === currentFaculty.id && s.status === 'PendingReceiver');

    // C. Substitution alert summaries
    const subbingAlerts = substituteAllocations.filter(a => a.date === selectedDate && a.substitute_faculty_id === currentFaculty.id);
    const coveredAlerts = substituteAllocations.filter(a => a.date === selectedDate && a.original_faculty_id === currentFaculty.id);

    const pendingSubRequests = (substitutionRequests || []).filter(
      r => r.substitute_faculty_id === currentFaculty.id && r.status === 'Pending'
    );

    return (
      <div className="space-y-6">
        
        {/* Pending Substitution Requests Cards */}
        {pendingSubRequests.length > 0 && (
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Incoming Substitution Requests
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingSubRequests.map(req => {
                const leave = leaveRequests.find(l => String(l.id) === String(req.leave_request_id));
                const requesterFaculty = leave ? faculties.find(f => f.id === leave.faculty_id) : null;
                
                return (
                  <div key={req.id} className="bg-slate-900 border border-slate-805 p-5 rounded-xl flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                          Date: {req.date}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-950 border border-slate-850 rounded text-[10px] font-bold text-slate-400">
                          Period {req.period}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-200 mt-2">
                        {req.class_name} ({req.subject})
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Requesting Faculty: {requesterFaculty ? requesterFaculty.name : 'Unknown Faculty'}
                      </p>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => acceptSubstitutionRequest(req.id)}
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Cover</span>
                      </button>
                      <button
                        onClick={() => declineSubstitutionRequest(req.id)}
                        className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 text-slate-450 border border-slate-850 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline Cover</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Alerts / Coverage Panel */}
        {(subbingAlerts.length > 0 || coveredAlerts.length > 0) && (
          <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-2 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center">
              <Bell className="w-4 h-4 mr-1.5" /> Substitution Alerts Today
            </h4>
            <div className="text-xs space-y-1.5">
              {subbingAlerts.map(a => {
                const orig = faculties.find(f => f.id === a.original_faculty_id);
                const slot = timetable.find(t => t.faculty_id === a.original_faculty_id && t.period === a.period && t.day === dayOfWeek);
                return (
                  <p key={a.id} className="text-slate-300">
                    📢 You are scheduled to cover <span className="font-bold text-slate-100">{slot?.class_name} ({slot?.subject})</span> during <span className="font-bold text-indigo-300">Period {a.period}</span> for {orig?.name}.
                  </p>
                );
              })}
              {coveredAlerts.map(a => {
                const sub = faculties.find(f => f.id === a.substitute_faculty_id);
                const slot = timetable.find(t => t.faculty_id === a.original_faculty_id && t.period === a.period && t.day === dayOfWeek);
                return (
                  <p key={a.id} className="text-slate-350">
                    💡 Your class <span className="font-bold text-slate-200">{slot?.class_name} ({slot?.subject})</span> on Period {a.period} is being covered by <span className="font-bold text-indigo-400">{sub ? sub.name : 'No one (Free Period)'}</span>.
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {/* Grid: Daily schedule & Swap actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Daily teaching schedule list */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350">
                My Schedule - {selectedDate} ({dayOfWeek || 'Weekend'})
              </h3>
            </div>
            
            {!dayOfWeek ? (
              <div className="flex-grow py-12 border border-dashed border-slate-850 rounded-lg flex flex-col items-center justify-center text-slate-550 text-xs">
                Weekend schedule is empty. Select a weekday.
              </div>
            ) : isFetchingSlots ? (
              <div className="flex-grow space-y-3">
                {[1, 2, 3, 4, 5].map(p => (
                  <div key={p} className="p-3.5 border border-slate-850 rounded-xl flex items-center space-x-3.5 animate-pulse">
                    <span className="w-8 h-8 rounded-lg bg-slate-800 flex-shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 bg-slate-800 rounded w-2/5" />
                      <div className="h-2.5 bg-slate-850 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 flex-grow">
                {schedule.map(slot => (
                  <div 
                    key={slot.period} 
                    className={`p-3.5 border rounded-xl flex items-center justify-between transition text-left ${
                      slot.status === 'Normal' ? 'bg-slate-950/40 border-slate-850 hover:border-slate-800' :
                      slot.status === 'Subbing' ? 'bg-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/30' :
                      slot.status === 'Covered' ? 'bg-slate-950/60 border-slate-850 opacity-70' :
                      slot.status === 'Free' ? 'bg-amber-500/5 border-amber-500/20 border-dashed' :
                      'bg-slate-950/20 border-slate-850 opacity-40' // Leave
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      {/* Period Badge */}
                      <span className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-black text-slate-400">
                        P{slot.period}
                      </span>
                      
                      <div>
                        {slot.details ? (
                          <>
                            <p className="text-xs font-bold text-slate-200">
                              {slot.details.class_name} <span className="text-slate-500 font-medium">({slot.details.subject})</span>
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {slot.status === 'Normal' && 'Teaching'}
                              {slot.status === 'Subbing' && `Covering for ${slot.details.original_name}`}
                              {slot.status === 'Covered' && `Covered by ${slot.details.original_name}`}
                              {slot.status === 'Free' && 'Free Period'}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-slate-550 font-medium">No teaching slot assigned</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {slot.status === 'Normal' && slot.details && (
                        <button
                          onClick={() => handleQuickSwap()}
                          className="px-2 py-1 bg-slate-950 border border-slate-850 hover:border-slate-800 text-[10px] font-bold text-slate-400 hover:text-indigo-400 rounded-md transition"
                        >
                          Request Swap
                        </button>
                      )}
                      
                      {slot.status === 'Subbing' && (
                        <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          Covering
                        </span>
                      )}
                      {slot.status === 'Covered' && (
                        <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-850">
                          Covered
                        </span>
                      )}
                      {slot.status === 'Free' && (
                        <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                          Free Period
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending swaps list */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl flex flex-col justify-between text-left">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-3.5 flex items-center">
                <UserCheck className="w-4 h-4 text-indigo-400 mr-2" />
                Received Swap Requests
              </h3>
              
              {receivedSwaps.length === 0 ? (
                <div className="py-10 border border-dashed border-slate-850 rounded-lg text-center text-slate-550 text-xs">
                  No pending swap invitations.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {receivedSwaps.map(s => {
                    const req = faculties.find(f => f.id === s.requester_faculty_id);
                    return (
                      <div key={s.id} className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-2">
                        <div className="text-xs">
                          <span className="font-bold text-indigo-400">{req?.name}</span> requests you to cover:
                          <p className="font-bold text-slate-200 mt-1">{s.class_name} ({s.subject})</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-mono">Date: {s.date} | Period {s.period}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => respondToSwap(s.id, true)}
                            className="flex-grow py-1 bg-emerald-650 hover:bg-emerald-700 text-emerald-50 text-[10px] font-bold rounded transition flex items-center justify-center"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => respondToSwap(s.id, false)}
                            className="px-2 py-1 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-400 text-[10px] font-bold rounded transition"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Quick reminder text */}
            <div className="mt-6 pt-4 border-t border-slate-850/60 text-[10px] text-slate-500">
              💡 Swaps accepted by you will go to the Admin panel for final schedule placement.
            </div>
          </div>
        </div>

        {/* Actions Row: Leave request & Peer Swap Request Clean Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Submit Leave request Card */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl text-left flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-3 flex items-center">
                <FileText className="w-4 h-4 text-indigo-400 mr-2" />
                Leave Application
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Apply for administrative leave of absence, specify reason details, and automatically update your daily timetable with substitute coverage parameters.
              </p>
            </div>
            <button
              onClick={() => {
                setCurrentPage('leaves');
                setActiveLeaveTab('form');
              }}
              className="w-full py-2.5 px-4 bg-indigo-650 hover:bg-indigo-700 text-indigo-50 font-bold rounded-lg text-xs transition flex items-center justify-center space-x-2"
            >
              <span>Apply for Leave</span>
            </button>
          </div>

          {/* Submit Peer Swap Request Card */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl text-left flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-3 flex items-center">
                <Send className="w-4 h-4 text-indigo-400 mr-2" />
                Hour Swaps
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Propose period and class hour swaps directly to substitute colleagues. Swaps require colleague acceptance and final administrative sign-off.
              </p>
            </div>
            <button
              onClick={() => {
                setCurrentPage('leaves');
              }}
              className="w-full py-2.5 px-4 bg-indigo-650 hover:bg-indigo-700 text-indigo-50 font-bold rounded-lg text-xs transition flex items-center justify-center space-x-2"
            >
              <span>Request Hour Swap</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-900 text-left">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center">
            {currentFaculty?.is_admin ? (
              <>
                <Shield className="w-6 h-6 text-indigo-400 mr-2" />
                Operations Dashboard (Admin Mode)
              </>
            ) : (
              <>
                <BookOpen className="w-6 h-6 text-indigo-400 mr-2" />
                Faculty Dashboard & Requests
              </>
            )}
          </h1>
          <p className="text-slate-400 text-sm">
            Welcome back, <span className="font-semibold text-indigo-400">{currentFaculty?.name || 'User'}</span>. Active Term: Fall 2026.
          </p>
        </div>

        {/* Global Date Selector */}
        <div className="flex items-center space-x-3.5 bg-slate-900 border border-slate-850 px-4 py-2 rounded-xl shrink-0">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <div className="text-left">
            <span className="block text-[8px] font-bold uppercase tracking-widest text-slate-500">Selected Query Date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-200 focus:outline-none p-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main role content wrapper */}
      {currentFaculty?.is_admin ? <AdminDashboard /> : <FacultyDashboard />}


      {/* ═══════════════════════════════════════════════════════════════
          DATA TABLES — Full System View
          ═══════════════════════════════════════════════════════════════ */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <span className="badge">Live System Data</span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', margin: 0, lineHeight: 1.1 }}>
            Database Records
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', marginTop: '0.375rem' }}>
            Real-time view of all timetable, leave, substitution, and allocation data.
          </p>
        </div>

        {/* ── ROW 1: Timetable + Faculty ─────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>

          {/* Full Class Timetable */}
          <div className="glass-panel" style={{ borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem 0.875rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="badge" style={{ marginBottom: '0.5rem', fontSize: '0.6rem' }}>Master Record</span>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                Class Timetable
              </h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                {timetable.length} slot{timetable.length !== 1 ? 's' : ''} across all faculty
              </p>
            </div>
            <div style={{ overflowX: 'auto', maxHeight: '320px', overflowY: 'auto' }}>
              {timetable.length === 0 ? (
                <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>
                  No timetable data loaded.
                </div>
              ) : (
                <table className="glass-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: '1.5rem' }}>Day</th>
                      <th>P#</th>
                      <th>Faculty</th>
                      <th>Class</th>
                      <th style={{ paddingRight: '1.5rem' }}>Subject</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timetable
                      .slice()
                      .sort((a, b) => {
                        const dayOrder = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
                        return (dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)) || (a.period - b.period);
                      })
                      .map(t => {
                        const fac = faculties.find(f => f.id === t.faculty_id);
                        return (
                          <tr key={t.id}>
                            <td style={{ paddingLeft: '1.5rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>{t.day}</td>
                            <td>
                              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.75rem', height: '1.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>
                                {t.period}
                              </span>
                            </td>
                            <td style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                              {fac?.name ?? <span style={{ color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>Unknown</span>}
                            </td>
                            <td style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{t.class_name}</td>
                            <td style={{ paddingRight: '1.5rem', color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>{t.subject}</td>
                          </tr>
                        );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Faculty Directory */}
          <div className="glass-panel" style={{ borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem 0.875rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="badge" style={{ marginBottom: '0.5rem', fontSize: '0.6rem' }}>Directory</span>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                Faculty Register
              </h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                {faculties.length} registered member{faculties.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div style={{ overflowX: 'auto', maxHeight: '320px', overflowY: 'auto' }}>
              {faculties.length === 0 ? (
                <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>
                  No faculty records.
                </div>
              ) : (
                <table className="glass-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: '1.5rem' }}>Name</th>
                      <th>Department</th>
                      <th>Specialization</th>
                      <th style={{ paddingRight: '1.5rem' }}>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faculties.map(f => (
                      <tr key={f.id}>
                        <td style={{ paddingLeft: '1.5rem', fontWeight: 600, color: '#fff' }}>{f.name}</td>
                        <td style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{f.dept}</td>
                        <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{f.specialization}</td>
                        <td style={{ paddingRight: '1.5rem' }}>
                          <span className={`status-pill ${f.is_admin ? 'status-approved' : 'status-pending'}`}
                            style={{ background: f.is_admin ? 'rgba(163,230,53,0.12)' : 'rgba(96,165,250,0.1)', borderColor: f.is_admin ? 'rgba(163,230,53,0.3)' : 'rgba(96,165,250,0.25)', color: f.is_admin ? '#bef264' : '#93c5fd' }}>
                            {f.is_admin ? 'Admin' : 'Faculty'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* ── ROW 2: Leave Requests + Substitution Requests ──────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>

          {/* Leave Requests */}
          <div className="glass-panel" style={{ borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem 0.875rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="badge" style={{ marginBottom: '0.5rem', fontSize: '0.6rem' }}>Applications</span>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                Leave Requests
              </h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                {leaveRequests.length} total · {leaveRequests.filter(l => l.status === 'Pending').length} pending
              </p>
            </div>
            <div style={{ overflowX: 'auto', maxHeight: '280px', overflowY: 'auto' }}>
              {leaveRequests.length === 0 ? (
                <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>
                  No leave requests found.
                </div>
              ) : (
                <table className="glass-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: '1.5rem' }}>Faculty</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Reason</th>
                      <th style={{ paddingRight: '1.5rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests.map(l => {
                      const fac = faculties.find(f => f.id === l.faculty_id);
                      return (
                        <tr key={l.id}>
                          <td style={{ paddingLeft: '1.5rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>
                            {fac?.name ?? 'Unknown'}
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>{l.start_date}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>{l.end_date}</td>
                          <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.reason}>
                            {l.reason}
                          </td>
                          <td style={{ paddingRight: '1.5rem' }}>
                            <span className={`status-pill ${l.status === 'Approved' ? 'status-approved' : l.status === 'Rejected' ? 'status-rejected' : 'status-pending'}`}>
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Substitution Requests */}
          <div className="glass-panel" style={{ borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem 0.875rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="badge" style={{ marginBottom: '0.5rem', fontSize: '0.6rem' }}>Coverage</span>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                Substitution Requests
              </h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                {(substitutionRequests || []).length} total · {(substitutionRequests || []).filter(r => r.status === 'Pending').length} pending
              </p>
            </div>
            <div style={{ overflowX: 'auto', maxHeight: '280px', overflowY: 'auto' }}>
              {(substitutionRequests || []).length === 0 ? (
                <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>
                  No substitution requests found.
                </div>
              ) : (
                <table className="glass-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: '1.5rem' }}>Substitute</th>
                      <th>Date</th>
                      <th>Period</th>
                      <th>Class</th>
                      <th>Subject</th>
                      <th style={{ paddingRight: '1.5rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(substitutionRequests || []).map(r => {
                      const subFac = faculties.find(f => f.id === r.substitute_faculty_id);
                      return (
                        <tr key={r.id}>
                          <td style={{ paddingLeft: '1.5rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>
                            {subFac?.name ?? 'Unknown'}
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>{r.date}</td>
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.5rem', height: '1.5rem', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>
                              {r.period}
                            </span>
                          </td>
                          <td style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{r.class_name}</td>
                          <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{r.subject}</td>
                          <td style={{ paddingRight: '1.5rem' }}>
                            <span className={`status-pill ${r.status === 'Accepted' ? 'status-approved' : r.status === 'Declined' ? 'status-rejected' : 'status-pending'}`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* ── ROW 3: Substitute Allocations + Swap Requests ─────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>

          {/* Substitute Allocations */}
          <div className="glass-panel" style={{ borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem 0.875rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="badge" style={{ marginBottom: '0.5rem', fontSize: '0.6rem' }}>Engine Output</span>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                Substitute Allocations
              </h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                {substituteAllocations.length} total allocation{substituteAllocations.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div style={{ overflowX: 'auto', maxHeight: '280px', overflowY: 'auto' }}>
              {substituteAllocations.length === 0 ? (
                <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>
                  No allocations generated yet.
                </div>
              ) : (
                <table className="glass-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: '1.5rem' }}>Date</th>
                      <th>P#</th>
                      <th>Absent Faculty</th>
                      <th style={{ paddingRight: '1.5rem' }}>Substitute</th>
                    </tr>
                  </thead>
                  <tbody>
                    {substituteAllocations.map(a => {
                      const orig = faculties.find(f => f.id === a.original_faculty_id);
                      const sub = faculties.find(f => f.id === a.substitute_faculty_id);
                      return (
                        <tr key={a.id}>
                          <td style={{ paddingLeft: '1.5rem', fontFamily: 'monospace', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>{a.date}</td>
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.5rem', height: '1.5rem', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>
                              {a.period}
                            </span>
                          </td>
                          <td style={{ color: 'rgba(248,113,113,0.85)', fontSize: '0.8rem', fontWeight: 600 }}>
                            {orig?.name ?? 'Unknown'}
                          </td>
                          <td style={{ paddingRight: '1.5rem' }}>
                            {sub ? (
                              <span style={{ color: '#6ee7b7', fontWeight: 600, fontSize: '0.8rem' }}>{sub.name}</span>
                            ) : (
                              <span className="status-pill status-pending" style={{ fontSize: '0.65rem' }}>Free Period</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Hour Swap Requests */}
          <div className="glass-panel" style={{ borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem 0.875rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="badge" style={{ marginBottom: '0.5rem', fontSize: '0.6rem' }}>Peer Exchange</span>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                Hour Swap Log
              </h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                {swapRequests.length} total swap{swapRequests.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div style={{ overflowX: 'auto', maxHeight: '280px', overflowY: 'auto' }}>
              {swapRequests.length === 0 ? (
                <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>
                  No swap requests recorded.
                </div>
              ) : (
                <table className="glass-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: '1.5rem' }}>Requester</th>
                      <th>Receiver</th>
                      <th>Class / Period</th>
                      <th>Subject</th>
                      <th style={{ paddingRight: '1.5rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {swapRequests.map(s => {
                      const req = faculties.find(f => f.id === s.requester_faculty_id);
                      const rec = faculties.find(f => f.id === s.receiver_faculty_id);
                      return (
                        <tr key={s.id}>
                          <td style={{ paddingLeft: '1.5rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>
                            {req?.name ?? 'Unknown'}
                          </td>
                          <td style={{ color: 'rgba(147,197,253,0.9)', fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                            {rec?.name ?? 'Unknown'}
                          </td>
                          <td style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem' }}>
                            {s.class_name} · P{s.period}
                          </td>
                          <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                            {s.subject}
                          </td>
                          <td style={{ paddingRight: '1.5rem' }}>
                            <span className={`status-pill ${s.status === 'Approved' ? 'status-approved' : s.status === 'Rejected' ? 'status-rejected' : 'status-pending'}`}>
                              {s.status === 'PendingReceiver' ? 'Peer' : s.status === 'PendingAdmin' ? 'Admin' : s.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* ── ROW 4: Operational Event Feed (full width) ─────────── */}
        <div className="glass-panel" style={{ borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem 0.875rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span className="badge" style={{ marginBottom: '0.5rem', fontSize: '0.6rem' }}>Audit Log</span>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                Operational Event Feed
              </h3>
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(163,230,53,0.8)', border: '1px solid rgba(163,230,53,0.2)', padding: '0.2rem 0.625rem', borderRadius: '9999px', background: 'rgba(163,230,53,0.08)' }}>
              Live
            </span>
          </div>
          {eventLogs.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>
              No system events recorded yet.
            </div>
          ) : (
            <table className="glass-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ paddingLeft: '1.5rem' }}>Time</th>
                  <th>Type</th>
                  <th style={{ paddingRight: '1.5rem' }}>Event Message</th>
                </tr>
              </thead>
              <tbody>
                {eventLogs.slice(0, 20).map(log => (
                  <tr key={log.id}>
                    <td style={{ paddingLeft: '1.5rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid',
                        background: log.type === 'success' ? 'rgba(52,211,153,0.1)' : log.type === 'warning' ? 'rgba(251,191,36,0.1)' : log.type === 'error' ? 'rgba(248,113,113,0.1)' : 'rgba(99,102,241,0.1)',
                        color: log.type === 'success' ? '#6ee7b7' : log.type === 'warning' ? '#fcd34d' : log.type === 'error' ? '#fca5a5' : '#a5b4fc',
                        borderColor: log.type === 'success' ? 'rgba(52,211,153,0.25)' : log.type === 'warning' ? 'rgba(251,191,36,0.25)' : log.type === 'error' ? 'rgba(248,113,113,0.25)' : 'rgba(99,102,241,0.25)',
                      }}>
                        {log.type}
                      </span>
                    </td>
                    <td style={{ paddingRight: '1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

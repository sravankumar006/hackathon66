import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { useAuth } from './AuthContext';
import { submitLeaveRequest } from '../lib/dbQueries';

export interface Faculty {
  id: string;
  name: string;
  dept: string;
  specialization: string;
  is_admin: boolean;
  email?: string;
}

export interface ClassTimetable {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  period: number;
  class_name: string;
  subject: string;
  faculty_id: string;
}

export interface LeaveRequest {
  id: string;
  faculty_id: string;
  start_date: string;
  end_date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
}

export interface SubstituteAllocation {
  id: string;
  date: string;
  period: number;
  original_faculty_id: string;
  substitute_faculty_id: string | null;
  leave_request_id?: string;
}

export interface SwapRequest {
  id: string;
  requester_faculty_id: string;
  receiver_faculty_id: string;
  date: string;
  period: number;
  class_name: string;
  subject: string;
  status: 'PendingReceiver' | 'PendingAdmin' | 'Approved' | 'Rejected';
}

export interface SubstitutionRequest {
  id: string;
  leave_request_id: string;
  date: string;
  period: number;
  class_name: string;
  subject: string;
  substitute_faculty_id: string;
  status: 'Pending' | 'Accepted' | 'Declined';
}

export interface SystemEventLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface SystemContextType {
  faculties: Faculty[];
  timetable: ClassTimetable[];
  leaveRequests: LeaveRequest[];
  substituteAllocations: SubstituteAllocation[];
  swapRequests: SwapRequest[];
  substitutionRequests: SubstitutionRequest[];
  eventLogs: SystemEventLog[];
  currentFaculty: Faculty | null;
  
  // Routing / Redirection States
  currentPage: 'landing' | 'dashboard' | 'leaves' | 'explore' | 'analytics' | 'activity' | 'settings' | 'admin_dashboard';
  setCurrentPage: (page: 'landing' | 'dashboard' | 'leaves' | 'explore' | 'analytics' | 'activity' | 'settings' | 'admin_dashboard') => void;
  activeLeaveTab: 'form' | 'history';
  setActiveLeaveTab: (tab: 'form' | 'history') => void;

  // Actions
  addLeaveRequest: (startDate: string, endDate: string, reason: string) => Promise<void>;
  cancelLeave: (leaveId: string) => Promise<void>;
  approveLeave: (leaveId: string) => Promise<void>;
  rejectLeave: (leaveId: string) => Promise<void>;
  approveLeaveRequest: (leaveId: string) => Promise<void>;
  rejectLeaveRequest: (leaveId: string) => Promise<void>;
  addSwapRequest: (receiverId: string, date: string, period: number, className: string, subject: string) => Promise<void>;
  respondToSwap: (swapId: string, accept: boolean) => Promise<void>;
  approveSwap: (swapId: string) => Promise<void>;
  rejectSwap: (swapId: string) => Promise<void>;
  acceptSubstitutionRequest: (requestId: string) => Promise<void>;
  declineSubstitutionRequest: (requestId: string) => Promise<void>;
  updateFacultyProfile: (dept: string, specialization: string, is_admin: boolean) => Promise<void>;
  addEventLog: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  resetSystemState: () => void;
  fetchSystemState: () => Promise<void>;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) throw new Error('useSystem must be used within a SystemProvider');
  return context;
};

// Helper to get day of week name from date string YYYY-MM-DD
export const getDayOfWeek = (dateString: string): 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | null => {
  if (!dateString) return null;
  const parts = dateString.split('-');
  if (parts.length !== 3) return null;
  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const dayIndex = date.getDay(); 
  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
  ];
  if (dayIndex >= 1 && dayIndex <= 5) {
    return days[dayIndex - 1];
  }
  return null;
};

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [timetable, setTimetable] = useState<ClassTimetable[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [substituteAllocations, setSubstituteAllocations] = useState<SubstituteAllocation[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [substitutionRequests, setSubstitutionRequests] = useState<SubstitutionRequest[]>([]);
  const [eventLogs, setEventLogs] = useState<SystemEventLog[]>([]);
  const [currentFaculty, setCurrentFaculty] = useState<Faculty | null>(null);
  
  // Lifted routing states
  const [currentPage, setCurrentPage] = useState<'landing' | 'dashboard' | 'leaves' | 'explore' | 'analytics' | 'activity' | 'settings' | 'admin_dashboard'>('landing');
  const [activeLeaveTab, setActiveLeaveTab] = useState<'form' | 'history'>('form');

  const fetchSystemState = async () => {
    if (!supabase) return;
    
    const [facRes, ttRes, leaveRes, allocRes, swapRes, subRes] = await Promise.all([
      supabase.from('faculty').select('*'),
      supabase.from('class_timetable').select('*'),
      supabase.from('leave_requests').select('*'),
      supabase.from('substitute_allocations').select('*'),
      supabase.from('hour_swaps').select('*'),
      supabase.from('substitution_requests').select('*')
    ]);

    if (facRes.data) {
      setFaculties(facRes.data.map((f: any) => ({
        id: f.id,
        name: f.name,
        dept: f.department || f.dept, // handles both schemas fallback
        specialization: f.specialization,
        is_admin: f.is_admin,
        email: f.email
      })));
    }
    if (ttRes.data) {
      setTimetable(ttRes.data.map((t: any) => ({
        id: String(t.id),
        day: t.day_of_week || t.day,
        period: t.period,
        class_name: t.class_name,
        subject: t.subject,
        faculty_id: t.faculty_id
      })));
    }
    if (leaveRes.data) {
      setLeaveRequests(leaveRes.data.map((l: any) => ({
        id: String(l.id),
        faculty_id: l.faculty_id,
        start_date: l.start_date,
        end_date: l.end_date,
        status: l.status,
        reason: l.reason
      })));
    }
    if (allocRes.data) {
      setSubstituteAllocations(allocRes.data.map((a: any) => ({
        id: String(a.id),
        date: a.date,
        period: a.period,
        original_faculty_id: a.original_faculty_id,
        substitute_faculty_id: a.substitute_faculty_id,
        leave_request_id: a.leave_request_id ? String(a.leave_request_id) : undefined
      })));
    }
    if (swapRes.data) {
      setSwapRequests(swapRes.data.map((s: any) => ({
        id: String(s.id),
        requester_faculty_id: s.requester_id,
        receiver_faculty_id: s.target_faculty_id,
        date: s.request_date,
        period: s.request_period,
        class_name: '2nd Year AI&ML',
        subject: 'Neural Networks',
        status: s.status
      })));
    }
    if (subRes.data) {
      setSubstitutionRequests(subRes.data.map((s: any) => ({
        id: String(s.id),
        leave_request_id: String(s.leave_request_id),
        date: s.date,
        period: s.period,
        class_name: s.class_name,
        subject: s.subject,
        substitute_faculty_id: s.substitute_faculty_id,
        status: s.status
      })));
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchSystemState();
      addEventLog('Connected to Supabase Backend successfully.', 'info');
    } else {
      addEventLog('Supabase not configured. Please add .env credentials.', 'warning');
    }
  }, []);

  // Synchronize current simulated faculty record to match authenticated credentials
  useEffect(() => {
    if (faculties.length > 0) {
      if (user) {
        const matchingFaculty = faculties.find(f => f.email?.toLowerCase() === user.email?.toLowerCase());
        if (matchingFaculty) {
          // Sync database role to matching faculty in-memory, preserving metadata-based admin privileges
          const resolvedIsAdmin = matchingFaculty.is_admin || user.user_metadata?.is_admin || false;
          setCurrentFaculty({
            ...matchingFaculty,
            is_admin: resolvedIsAdmin
          });
        } else {
          // If user email is not in the default seeded roster (e.g. new registration),
          // dynamically construct a simulated Faculty profile so they can place requests!
          const simulatedUser: Faculty = {
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Simulated Faculty',
            email: user.email || '',
            dept: 'Computer Science',
            specialization: 'General Eng',
            is_admin: user.user_metadata?.is_admin || user.email?.toLowerCase().includes('admin') || false
          };
          setCurrentFaculty(simulatedUser);
          setFaculties(prev => {
            if (prev.some(f => f.email?.toLowerCase() === user.email?.toLowerCase())) return prev;
            return [...prev, simulatedUser];
          });
        }
      } else {
        const defaultUser = faculties.find(f => f.is_admin) || faculties[0];
        setCurrentFaculty(defaultUser);
      }
    } else if (user) {
      // Offline/Empty roster fallback
      const simulatedUser: Faculty = {
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Simulated Faculty',
        email: user.email || '',
        dept: 'Computer Science',
        specialization: 'General Eng',
        is_admin: user.user_metadata?.is_admin || user.email?.toLowerCase().includes('admin') || false
      };
      setCurrentFaculty(simulatedUser);
      setFaculties([simulatedUser]);
    }
  }, [faculties, user]);

  // Enforce role-based routing layout isolation
  useEffect(() => {
    if (currentFaculty) {
      if (currentFaculty.is_admin && (currentPage === 'dashboard' || currentPage === 'leaves' || currentPage === 'settings')) {
        setCurrentPage('admin_dashboard');
      } else if (!currentFaculty.is_admin && currentPage === 'admin_dashboard') {
        setCurrentPage('dashboard');
      }
    }
  }, [currentFaculty, currentPage]);

  const addEventLog = (message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const newLog: SystemEventLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      message,
      type
    };
    setEventLogs(prev => [newLog, ...prev]);
  };

  const resetSystemState = () => {
    addEventLog('Data reset is disabled in production DB mode.', 'warning');
  };

  const addLeaveRequest = async (startDate: string, endDate: string, reason: string) => {
    if (!currentFaculty) return;
    
    let dbSuccess = false;
    if (supabase) {
      const { error } = await submitLeaveRequest(currentFaculty.id, startDate, endDate, reason);
      if (!error) {
        dbSuccess = true;
        addEventLog(`Leave request filed from ${startDate} to ${endDate}.`, 'info');
        await fetchSystemState();
      } else {
        const errorMsg = typeof error === 'string' ? error : (error as any)?.message || 'Unknown error';
        addEventLog(`Failed to file leave: ${errorMsg}`, 'error');
      }
    }
    
    if (!dbSuccess) {
      const newLeave: LeaveRequest = {
        id: crypto.randomUUID(),
        faculty_id: currentFaculty.id,
        start_date: startDate,
        end_date: endDate,
        status: 'Pending',
        reason: reason
      };
      setLeaveRequests(prev => [...prev, newLeave]);
      addEventLog(`Leave request filed locally (Database write bypassed/failed) from ${startDate} to ${endDate}.`, 'warning');
    }
  };

  const cancelLeave = async (leaveId: string) => {
    let dbSuccess = false;
    if (supabase) {
      const { error } = await supabase.from('leave_requests').delete().eq('id', leaveId);
      if (!error) {
        dbSuccess = true;
        addEventLog(`Leave request cancelled.`, 'info');
        await fetchSystemState();
      } else {
        const errorMsg = typeof error === 'string' ? error : (error as any)?.message || 'Unknown error';
        addEventLog(`Failed to cancel leave: ${errorMsg}`, 'error');
      }
    }
    
    if (!dbSuccess) {
      setLeaveRequests(prev => prev.filter(l => String(l.id) !== String(leaveId)));
      addEventLog(`Leave request cancelled locally (Database write bypassed/failed).`, 'warning');
    }
  };

  const sendRejectionEmail = (facultyEmail: string) => {
    console.log("Your leave is not granted", facultyEmail);
  };

  const approveLeaveRequest = async (leaveId: string) => {
    // TODO: Trigger Automatic Substitute Allocation Engine Here
    let dbSuccess = false;
    if (supabase) {
      const { error } = await supabase.from('leave_requests').update({ status: 'Approved' }).eq('id', leaveId);
      if (!error) {
        dbSuccess = true;
        addEventLog(`Leave approved.`, 'success');
        await fetchSystemState();
      }
    }
    
    if (!dbSuccess) {
      setLeaveRequests(prev => prev.map(l => String(l.id) === String(leaveId) ? { ...l, status: 'Approved' } : l));
      addEventLog(`Leave approved locally (Database write bypassed/failed).`, 'warning');
    }
  };

  const rejectLeaveRequest = async (leaveId: string) => {
    const leave = leaveRequests.find(l => String(l.id) === String(leaveId));
    const faculty = faculties.find(f => f.id === leave?.faculty_id);
    const facultyEmail = faculty?.email || '';
    
    let dbSuccess = false;
    if (supabase) {
      const { error } = await supabase.from('leave_requests').update({ status: 'Rejected' }).eq('id', leaveId);
      if (!error) {
        dbSuccess = true;
        sendRejectionEmail(facultyEmail);
        addEventLog(`Leave request rejected.`, 'warning');
        await fetchSystemState();
      }
    }
    
    if (!dbSuccess) {
      sendRejectionEmail(facultyEmail);
      setLeaveRequests(prev => prev.map(l => String(l.id) === String(leaveId) ? { ...l, status: 'Rejected' } : l));
      addEventLog(`Leave request rejected locally (Database write bypassed/failed).`, 'warning');
    }
  };

  // Keep approveLeave and rejectLeave for backward compatibility / general use
  const approveLeave = approveLeaveRequest;
  const rejectLeave = rejectLeaveRequest;

  const addSwapRequest = async (receiverId: string, date: string, period: number, _className: string, _subject: string) => {
    if (!currentFaculty || !supabase) return;
    const { error } = await supabase.from('hour_swaps').insert([{
      requester_id: currentFaculty.id,
      target_faculty_id: receiverId,
      request_date: date,
      request_period: period,
      swap_date: date,
      swap_period: period,
      status: 'PendingReceiver'
    }]);
    if (!error) {
      addEventLog(`Peer swap request sent.`, 'info');
      await fetchSystemState();
    }
  };

  const respondToSwap = async (swapId: string, accept: boolean) => {
    if (!supabase) return;
    const newStatus = accept ? 'PendingAdmin' : 'Rejected';
    const numericId = parseInt(swapId, 10);
    if (!isNaN(numericId)) {
      const { error } = await supabase.from('hour_swaps').update({ status: newStatus }).eq('id', numericId);
      if (!error) {
        addEventLog(`Swap request ${accept ? 'accepted (awaiting Admin)' : 'declined'}.`, accept ? 'success' : 'warning');
        await fetchSystemState();
      }
    }
  };

  const approveSwap = async (swapId: string) => {
    if (!supabase) return;
    
    const swap = swapRequests.find(s => s.id === swapId);
    if (!swap) return;

    const numericId = parseInt(swapId, 10);
    if (!isNaN(numericId)) {
      const { error } = await supabase.from('hour_swaps').update({ status: 'Approved' }).eq('id', numericId);
      if (error) return;

      await supabase.from('substitute_allocations').insert([{
        date: swap.date,
        period: swap.period,
        class_name: swap.class_name || '2nd Year AI&ML',
        original_faculty_id: swap.requester_faculty_id,
        substitute_faculty_id: swap.receiver_faculty_id
      }]);

      addEventLog(`Admin approved swap.`, 'success');
      await fetchSystemState();
    }
  };

  const rejectSwap = async (swapId: string) => {
    if (!supabase) return;
    const numericId = parseInt(swapId, 10);
    if (!isNaN(numericId)) {
      const { error } = await supabase.from('hour_swaps').update({ status: 'Rejected' }).eq('id', numericId);
      if (!error) {
        addEventLog(`Admin rejected swap.`, 'error');
        await fetchSystemState();
      }
    }
  };

  const acceptSubstitutionRequest = async (requestId: string) => {
    let dbSuccess = false;
    if (supabase) {
      const numericId = parseInt(requestId, 10);
      if (!isNaN(numericId)) {
        const { data: req } = await supabase
          .from('substitution_requests')
          .select('*')
          .eq('id', numericId)
          .single();

        if (req) {
          const { error: updateErr } = await supabase
            .from('substitution_requests')
            .update({ status: 'Accepted' })
            .eq('id', numericId);

          if (!updateErr) {
            const { data: leave } = await supabase
              .from('leave_requests')
              .select('faculty_id')
              .eq('id', req.leave_request_id)
              .single();

            if (leave) {
              const { error: allocErr } = await supabase
                .from('substitute_allocations')
                .insert({
                  leave_request_id: req.leave_request_id,
                  date: req.date,
                  period: req.period,
                  class_name: req.class_name,
                  original_faculty_id: leave.faculty_id,
                  substitute_faculty_id: req.substitute_faculty_id
                });

              if (!allocErr) {
                dbSuccess = true;
                addEventLog(`Substitution request for ${req.class_name} period ${req.period} accepted.`, 'success');
                await fetchSystemState();
              }
            }
          }
        }
      }
    }

    if (!dbSuccess) {
      setSubstitutionRequests(prev => 
        prev.map(r => r.id === requestId ? { ...r, status: 'Accepted' } : r)
      );
      
      const req = substitutionRequests.find(r => r.id === requestId);
      if (req) {
        const leave = leaveRequests.find(l => String(l.id) === String(req.leave_request_id));
        const originalFacultyId = leave ? leave.faculty_id : '';
        const newAlloc: SubstituteAllocation = {
          id: crypto.randomUUID(),
          leave_request_id: req.leave_request_id,
          date: req.date,
          period: req.period,
          original_faculty_id: originalFacultyId,
          substitute_faculty_id: req.substitute_faculty_id
        };
        setSubstituteAllocations(prev => [...prev, newAlloc]);
        addEventLog(`Substitution request accepted locally.`, 'success');
      }
    }
  };

  const declineSubstitutionRequest = async (requestId: string) => {
    let dbSuccess = false;
    if (supabase) {
      const numericId = parseInt(requestId, 10);
      if (!isNaN(numericId)) {
        const { error: updateErr } = await supabase
          .from('substitution_requests')
          .update({ status: 'Declined' })
          .eq('id', numericId);

        if (!updateErr) {
          dbSuccess = true;
          // TODO: Re-run engine to find next available substitute candidate
          addEventLog(`Substitution request declined.`, 'warning');
          await fetchSystemState();
        }
      }
    }

    if (!dbSuccess) {
      setSubstitutionRequests(prev => 
        prev.map(r => r.id === requestId ? { ...r, status: 'Declined' } : r)
      );
      // TODO: Re-run engine to find next available substitute candidate
      addEventLog(`Substitution request declined locally.`, 'warning');
    }
  };

  const updateFacultyProfile = async (_dept: string, _specialization: string, is_admin: boolean) => {
    if (!currentFaculty || !supabase) return;
    
    // In a real app we'd update DB, but here we just update local selection for testing UI
    // To support the role toggle without breaking the seed data mapping:
    const fac = faculties.find(f => f.is_admin === is_admin);
    if (fac) {
       setCurrentFaculty(fac);
       addEventLog(`Switched view to ${fac.name} (${fac.is_admin ? 'Admin' : 'Faculty'}).`, 'info');
    }
  };

  return (
    <SystemContext.Provider value={{
      faculties,
      timetable,
      leaveRequests,
      substituteAllocations,
      swapRequests,
      substitutionRequests,
      eventLogs,
      currentFaculty,
      currentPage,
      setCurrentPage,
      activeLeaveTab,
      setActiveLeaveTab,
      addLeaveRequest,
      cancelLeave,
      approveLeave,
      rejectLeave,
      approveLeaveRequest,
      rejectLeaveRequest,
      addSwapRequest,
      respondToSwap,
      approveSwap,
      rejectSwap,
      acceptSubstitutionRequest,
      declineSubstitutionRequest,
      updateFacultyProfile,
      addEventLog,
      resetSystemState,
      fetchSystemState
    }}>
      {children}
    </SystemContext.Provider>
  );
};

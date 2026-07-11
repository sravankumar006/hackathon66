import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { motion, AnimatePresence } from 'framer-motion';

export const LeaveSwaps: React.FC = () => {
  const { 
    currentFaculty, 
    faculties, 
    leaveRequests, 
    approveLeaveRequest, 
    rejectLeaveRequest, 
    addLeaveRequest,
    cancelLeave,
    activeLeaveTab: activeTab,
    setActiveLeaveTab: setActiveTab
  } = useSystem();
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  const leaveHistory = leaveRequests
    .filter(req => req.faculty_id === currentFaculty?.id)
    .slice()
    .reverse();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFaculty || !startDate || !endDate || !reason) return;
    
    setIsSubmitting(true);
    await addLeaveRequest(startDate, endDate, reason);
    setIsSubmitting(false);
    
    setStartDate('');
    setEndDate('');
    setReason('');
    setShowSuccessOverlay(true);
    setTimeout(() => {
      setShowSuccessOverlay(false);
      setActiveTab('history');
    }, 1500);
  };

  const handleCancel = async (id: string) => {
    await cancelLeave(id);
  };

  if (currentFaculty?.is_admin) {
    const pendingLeaves = leaveRequests.filter(l => l.status === 'Pending');
    return (
      <div className="w-full bg-white p-6 rounded-md shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-6 font-sans">HOD Approval Panel</h2>
        {pendingLeaves.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded border border-slate-100">
            <p className="text-slate-500 font-sans text-sm">No pending leave requests requiring approval.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Faculty</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {pendingLeaves.map((req) => {
                    const facultyObj = faculties.find(f => f.id === req.faculty_id);
                    return (
                      <motion.tr 
                        key={req.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-slate-100 hover:bg-slate-50 transition"
                      >
                        <td className="py-3 px-4 text-sm text-slate-700 font-semibold">
                          {facultyObj ? `${facultyObj.name} (${facultyObj.dept})` : 'Unknown'}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-700">
                          {req.start_date} <span className="text-slate-400 font-normal">to</span> {req.end_date}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 truncate max-w-[200px]" title={req.reason}>
                          {req.reason}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button 
                            onClick={() => approveLeaveRequest(req.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium transition"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => rejectLeaveRequest(req.id)}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium transition"
                          >
                            Reject
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col space-y-6 font-sans">
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('form')}
          className={`py-2.5 px-4 text-sm font-medium border-b-2 transition ${
            activeTab === 'form' 
              ? 'border-indigo-600 text-indigo-700' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Apply for Leave
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`py-2.5 px-4 text-sm font-medium border-b-2 transition ${
            activeTab === 'history' 
              ? 'border-indigo-600 text-indigo-700' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Leave History
        </button>
      </div>

      <div className="w-full">
        {activeTab === 'form' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-left">
            {/* Leave Request Form Panel */}
            <div className="bg-white p-6 rounded-md shadow-sm border border-slate-200 relative overflow-hidden">
              <h2 className="text-lg font-semibold text-slate-800 mb-6">Apply for Leave</h2>
              
              <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">End Date</label>
                  <input 
                    type="date" 
                    required
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Reason for Leave</label>
                  <textarea 
                    required
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 resize-none"
                    placeholder="Provide a brief explanation..."
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="mt-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>

              <AnimatePresence>
                {showSuccessOverlay && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Request Submitted</h3>
                    <p className="text-sm text-slate-500 mt-1">Your leave application has been forwarded to the administration.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Hour Swap Request Form Panel */}
            <div className="bg-white p-6 rounded-md shadow-sm border border-slate-200 relative overflow-hidden">
              <h2 className="text-lg font-semibold text-slate-800 mb-6 font-sans">Hour Swap Request Form</h2>
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Target Colleague</label>
                  <select 
                    disabled 
                    className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-50 text-slate-400 cursor-not-allowed text-sm"
                    defaultValue=""
                  >
                    <option value="" disabled>Select Colleague...</option>
                    {faculties.filter(f => f.id !== currentFaculty?.id && !f.is_admin).map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.dept})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Request Date</label>
                    <input 
                      type="date" 
                      disabled 
                      className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-50 text-slate-400 cursor-not-allowed text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Request Period</label>
                    <select 
                      disabled 
                      className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-50 text-slate-400 cursor-not-allowed text-sm"
                      defaultValue="1"
                    >
                      {[1, 2, 3, 4, 5].map(p => (
                        <option key={p} value={p}>Period {p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Swap Date</label>
                    <input 
                      type="date" 
                      disabled 
                      className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-50 text-slate-400 cursor-not-allowed text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Swap Period</label>
                    <select 
                      disabled 
                      className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-50 text-slate-400 cursor-not-allowed text-sm"
                      defaultValue="1"
                    >
                      {[1, 2, 3, 4, 5].map(p => (
                        <option key={p} value={p}>Period {p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button 
                  disabled 
                  className="mt-2 w-full py-2.5 bg-slate-100 text-slate-400 font-bold rounded cursor-not-allowed border border-slate-200/60 text-sm"
                >
                  Propose Hour Swap (Locked)
                </button>
                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  * Dynamic peer-to-peer swap operations are currently locked.
                </p>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-md shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Leave History</h2>
            
            {leaveHistory.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded border border-slate-100">
                <p className="text-slate-500">No previous leave requests found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {leaveHistory.map((req) => (
                        <motion.tr 
                          key={req.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-b border-slate-100 hover:bg-slate-50 transition"
                        >
                          <td className="py-3 px-4 text-sm text-slate-700 font-medium">
                            {req.start_date} <span className="text-slate-400 font-normal">to</span> {req.end_date}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600 truncate max-w-[200px]" title={req.reason}>
                            {req.reason}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
                              req.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                              'bg-rose-50 text-rose-600 border-rose-200'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {req.status === 'Pending' && (
                              <button 
                                onClick={() => handleCancel(req.id)}
                                className="text-xs text-rose-500 hover:text-rose-700 font-medium hover:underline"
                              >
                                Cancel Request
                              </button>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

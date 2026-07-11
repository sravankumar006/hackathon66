import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, FileText, Repeat, Send, CalendarDays } from 'lucide-react';

const statusPill = (status: string) => {
  switch (status) {
    case 'Pending':
    case 'PendingReceiver':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
    case 'PendingAdmin':
      return 'bg-sky-500/10 text-sky-400 border-sky-500/25';
    case 'Approved':
    case 'Accepted':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
    default:
      return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
  }
};

const swapStatusLabel = (status: string) => {
  switch (status) {
    case 'PendingReceiver': return 'Awaiting Colleague';
    case 'PendingAdmin': return 'Awaiting Admin';
    default: return status;
  }
};

export const LeaveSwaps: React.FC = () => {
  const {
    currentFaculty,
    faculties,
    leaveRequests,
    swapRequests,
    approveLeaveRequest,
    rejectLeaveRequest,
    addLeaveRequest,
    addSwapRequest,
    cancelLeave,
    activeLeaveTab: activeTab,
    setActiveLeaveTab: setActiveTab,
  } = useSystem();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  // Swap form state
  const [swapReceiver, setSwapReceiver] = useState('');
  const [swapDate, setSwapDate] = useState('');
  const [swapPeriod, setSwapPeriod] = useState('1');
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapFeedback, setSwapFeedback] = useState<string | null>(null);

  const leaveHistory = leaveRequests
    .filter((req) => req.faculty_id === currentFaculty?.id)
    .slice()
    .reverse();

  const mySwaps = swapRequests
    .filter((s) => s.requester_faculty_id === currentFaculty?.id)
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

  const handleSwapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFaculty || !swapReceiver || !swapDate) return;

    setIsSwapping(true);
    await addSwapRequest(swapReceiver, swapDate, parseInt(swapPeriod, 10), 'Scheduled Class', 'Hour Swap');
    setIsSwapping(false);

    setSwapReceiver('');
    setSwapDate('');
    setSwapPeriod('1');
    setSwapFeedback('Swap request sent to your colleague for confirmation.');
    setTimeout(() => setSwapFeedback(null), 3500);
  };

  const handleCancel = async (id: string) => {
    await cancelLeave(id);
  };

  // ── ADMIN VIEW ───────────────────────────────────────────
  if (currentFaculty?.is_admin) {
    const pendingLeaves = leaveRequests.filter((l) => l.status === 'Pending');
    return (
      <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl text-left">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-6 flex items-center">
          <FileText className="w-4 h-4 text-indigo-400 mr-2" />
          HOD Approval Panel
        </h2>
        {pendingLeaves.length === 0 ? (
          <div className="py-12 border border-dashed border-slate-850 rounded-lg text-center text-slate-550 text-xs">
            No pending leave requests requiring approval.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-850 text-slate-500">
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest">Faculty</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest">Duration</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest">Reason</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {pendingLeaves.map((req) => {
                    const facultyObj = faculties.find((f) => f.id === req.faculty_id);
                    return (
                      <motion.tr
                        key={req.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-slate-850/60 hover:bg-slate-950/40 transition"
                      >
                        <td className="py-3 px-4 text-slate-200 font-semibold">
                          {facultyObj ? `${facultyObj.name}` : 'Unknown'}
                          <span className="block text-[10px] text-slate-500 font-normal">
                            {facultyObj?.dept}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-300 font-mono">
                          {req.start_date} <span className="text-slate-600">→</span> {req.end_date}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-400 truncate max-w-[220px]" title={req.reason}>
                          {req.reason}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => approveLeaveRequest(req.id)}
                              className="px-3 py-1 bg-emerald-500/12 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold transition flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => rejectLeaveRequest(req.id)}
                              className="px-3 py-1 bg-rose-500/8 hover:bg-rose-500/16 text-rose-300 border border-rose-500/25 rounded-full text-xs font-bold transition flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
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

  // ── FACULTY VIEW ─────────────────────────────────────────
  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-slate-850">
        <button
          onClick={() => setActiveTab('form')}
          className={`py-2.5 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === 'form'
              ? 'border-indigo-500 text-indigo-300'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Apply for Leave & Swaps
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-2.5 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === 'history'
              ? 'border-indigo-500 text-indigo-300'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Request History
        </button>
      </div>

      {activeTab === 'form' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-left">
          {/* Leave Request Form */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl relative overflow-hidden">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-6 flex items-center">
              <CalendarDays className="w-4 h-4 text-indigo-400 mr-2" />
              Apply for Leave
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Start Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">End Date</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Reason for Leave</label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                  placeholder="Provide a brief explanation..."
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-indigo-50 font-bold rounded-lg text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
              </button>
            </form>

            <AnimatePresence>
              {showSuccessOverlay && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-3">
                    <Check className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-base font-bold text-slate-100">Request Submitted</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Your leave application has been forwarded to the administration.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hour Swap Request Form */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-6 flex items-center">
              <Repeat className="w-4 h-4 text-indigo-400 mr-2" />
              Hour Swap Request
            </h2>
            <form onSubmit={handleSwapSubmit} className="flex flex-col space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Target Colleague</label>
                <select
                  required
                  value={swapReceiver}
                  onChange={(e) => setSwapReceiver(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  <option value="" disabled>Select Colleague...</option>
                  {faculties
                    .filter((f) => f.id !== currentFaculty?.id && !f.is_admin)
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.dept})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Date</label>
                  <input
                    type="date"
                    required
                    value={swapDate}
                    onChange={(e) => setSwapDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Period</label>
                  <select
                    value={swapPeriod}
                    onChange={(e) => setSwapPeriod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  >
                    {[1, 2, 3, 4, 5].map((p) => (
                      <option key={p} value={p}>Period {p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSwapping || !swapReceiver || !swapDate}
                className="mt-1 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-indigo-50 font-bold rounded-lg text-sm transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isSwapping ? 'Sending...' : 'Propose Hour Swap'}
              </button>

              <AnimatePresence>
                {swapFeedback && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[11px] text-emerald-400 text-center leading-relaxed"
                  >
                    {swapFeedback}
                  </motion.p>
                )}
              </AnimatePresence>
              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                Your colleague must accept before the swap is sent to the Admin for final approval.
              </p>
            </form>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Leave History */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl text-left">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-6 flex items-center">
              <FileText className="w-4 h-4 text-indigo-400 mr-2" />
              Leave History
            </h2>

            {leaveHistory.length === 0 ? (
              <div className="py-10 border border-dashed border-slate-850 rounded-lg text-center text-slate-550 text-xs">
                No previous leave requests found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-500">
                      <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest">Duration</th>
                      <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest">Reason</th>
                      <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest">Status</th>
                      <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-right">Actions</th>
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
                          className="border-b border-slate-850/60 hover:bg-slate-950/40 transition"
                        >
                          <td className="py-3 px-4 text-xs text-slate-300 font-mono">
                            {req.start_date} <span className="text-slate-600">→</span> {req.end_date}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-400 truncate max-w-[220px]" title={req.reason}>
                            {req.reason}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusPill(req.status)}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {req.status === 'Pending' && (
                              <button
                                onClick={() => handleCancel(req.id)}
                                className="text-xs text-rose-400 hover:text-rose-300 font-semibold hover:underline"
                              >
                                Cancel
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

          {/* Swap History */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl text-left">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-6 flex items-center">
              <Repeat className="w-4 h-4 text-indigo-400 mr-2" />
              My Hour Swap Requests
            </h2>

            {mySwaps.length === 0 ? (
              <div className="py-10 border border-dashed border-slate-850 rounded-lg text-center text-slate-550 text-xs">
                You have not proposed any hour swaps yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-500">
                      <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest">Colleague</th>
                      <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest">Date</th>
                      <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest">Period</th>
                      <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {mySwaps.map((s) => {
                        const receiver = faculties.find((f) => f.id === s.receiver_faculty_id);
                        return (
                          <motion.tr
                            key={s.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="border-b border-slate-850/60 hover:bg-slate-950/40 transition"
                          >
                            <td className="py-3 px-4 text-xs text-slate-200 font-semibold">
                              {receiver ? receiver.name : 'Unknown'}
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-300 font-mono">{s.date}</td>
                            <td className="py-3 px-4 text-xs text-slate-300">Period {s.period}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusPill(s.status)}`}>
                                {swapStatusLabel(s.status)}
                              </span>
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
        </div>
      )}
    </div>
  );
};

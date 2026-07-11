import React, { useState, useEffect } from 'react';
import { useSystem } from '../context/SystemContext';
import { useAuth } from '../context/AuthContext';
import { updateLeaveStatus } from '../lib/dbQueries';
import { allocateSubstitutesForLeave } from '../lib/allocationEngine';
import { Check, X, FileText, RefreshCw, Layers } from 'lucide-react';

const sendRejectionEmail = (facultyEmail: string) => {
  console.log("Your leave is not granted", facultyEmail);
};

export const AdminDashboard: React.FC = () => {
  const { leaveRequests, faculties, swapRequests, approveSwap, rejectSwap, fetchSystemState } = useSystem();
  const { user, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<'leaves' | 'swaps'>('leaves');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localPendingLeaves, setLocalPendingLeaves] = useState<any[]>([]);
  const [loadingStates, setLoadingStates] = useState<Record<string, 'approving' | 'rejecting' | null>>({});

  useEffect(() => {
    setLocalPendingLeaves(leaveRequests.filter(req => req.status === 'Pending'));
  }, [leaveRequests]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSystemState();
    setIsRefreshing(false);
  };

  const handleApprove = async (id: string) => {
    setLoadingStates(prev => ({ ...prev, [id]: 'approving' }));
    const numericId = parseInt(id, 10);
    if (!isNaN(numericId)) {
      const { success, error } = await updateLeaveStatus(numericId, 'Approved');
      if (success) {
        await allocateSubstitutesForLeave(numericId);
        setLocalPendingLeaves(prev => prev.filter(req => req.id !== id));
      } else {
        console.error('Failed to approve leave:', error);
      }
    }
    setLoadingStates(prev => ({ ...prev, [id]: null }));
  };

  const handleReject = async (id: string) => {
    setLoadingStates(prev => ({ ...prev, [id]: 'rejecting' }));
    const numericId = parseInt(id, 10);
    if (!isNaN(numericId)) {
      const { success, error } = await updateLeaveStatus(numericId, 'Rejected');
      if (success) {
        const req = leaveRequests.find(l => String(l.id) === id);
        if (req) {
          const fac = faculties.find(f => f.id === req.faculty_id);
          if (fac?.email) sendRejectionEmail(fac.email);
        }
        setLocalPendingLeaves(prev => prev.filter(req => req.id !== id));
      } else {
        console.error('Failed to reject leave:', error);
      }
    }
    setLoadingStates(prev => ({ ...prev, [id]: null }));
  };

  return (
    <div className="chronos-app-shell">

      {/* ── ADMIN GLASS NAV ─────────────────────────────────── */}
      <header className="chronos-app-nav">
        <div className="chronos-app-nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span className="brand" style={{ fontSize: '1.1rem' }}>Chronos</span>
            <span className="badge" style={{ marginBottom: 0, fontSize: '0.65rem' }}>ADMIN PORTAL</span>
            <nav style={{ display: 'flex', gap: '0.25rem' }}>
              <button className="chronos-nav-link active">Requests Queue</button>
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{user?.email}</span>
            <button
              id="btn-admin-logout"
              onClick={() => signOut()}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 1.1rem', fontSize: '0.8rem' }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────────── */}
      <main className="chronos-main" style={{ paddingTop: '2rem' }}>

        {/* Page heading row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <span className="badge">HOD Operations</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', margin: 0, lineHeight: 1.1 }}>
              Faculty Requests Queue
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Process active leave applications and review hour swap request logs.
            </p>
          </div>
          <button
            id="btn-refresh-queue"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn btn-secondary"
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw style={{ width: '1rem', height: '1rem' }} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Glass tab switcher */}
        <div
          className="glass-panel"
          style={{ display: 'flex', gap: '0.25rem', padding: '0.375rem', marginBottom: '1.5rem', borderRadius: '14px', width: 'fit-content' }}
        >
          {(['leaves', 'swaps'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                border: '1px solid',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                background: activeTab === tab ? 'rgba(255,255,255,0.18)' : 'transparent',
                color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.45)',
                borderColor: activeTab === tab ? 'rgba(255,255,255,0.2)' : 'transparent',
              }}
            >
              {tab === 'leaves'
                ? `Leave Approvals (${localPendingLeaves.length})`
                : `Hour Swap Logs (${swapRequests.filter(s => s.status === 'PendingAdmin').length})`}
            </button>
          ))}
        </div>

        {/* ── TAB: LEAVES ─────────────────────────────────── */}
        {activeTab === 'leaves' ? (
          <div className="glass-panel" style={{ borderRadius: '20px', overflow: 'hidden' }}>
            {localPendingLeaves.length === 0 ? (
              <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                <FileText style={{ width: '2.5rem', height: '2.5rem', color: 'rgba(255,255,255,0.2)', margin: '0 auto 1rem' }} />
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                  No pending leave requests requiring approval.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: '1.5rem' }}>Faculty</th>
                      <th>Department</th>
                      <th>Leave Duration</th>
                      <th>Reason</th>
                      <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localPendingLeaves.map((req) => {
                      const requester = faculties.find(f => f.id === req.faculty_id);
                      const isRowLoading = loadingStates[req.id] != null;
                      return (
                        <tr key={req.id}>
                          <td style={{ paddingLeft: '1.5rem', fontWeight: 600, color: '#fff' }}>
                            {requester ? requester.name : 'Unknown Faculty'}
                          </td>
                          <td style={{ color: 'rgba(255,255,255,0.55)' }}>
                            {requester ? requester.dept : 'N/A'}
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                            {req.start_date} <span style={{ color: 'rgba(255,255,255,0.3)' }}>→</span> {req.end_date}
                          </td>
                          <td
                            style={{ color: 'rgba(255,255,255,0.55)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            title={req.reason}
                          >
                            {req.reason}
                          </td>
                          <td style={{ paddingRight: '1.5rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                              <button
                                id={`btn-approve-${req.id}`}
                                onClick={() => handleApprove(req.id)}
                                disabled={isRowLoading}
                                style={{
                                  padding: '0.4rem 0.875rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  border: '1px solid rgba(52,211,153,0.35)',
                                  background: 'rgba(52,211,153,0.12)',
                                  color: '#6ee7b7',
                                  cursor: isRowLoading ? 'not-allowed' : 'pointer',
                                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                                  opacity: isRowLoading ? 0.5 : 1,
                                  fontFamily: 'inherit',
                                  transition: 'all 0.2s',
                                }}
                              >
                                {loadingStates[req.id] === 'approving'
                                  ? <span className="chronos-spinner" style={{ width: '0.875rem', height: '0.875rem', borderTopColor: '#6ee7b7' }} />
                                  : <Check style={{ width: '0.875rem', height: '0.875rem' }} />
                                }
                                {loadingStates[req.id] === 'approving' ? 'Approving...' : 'Approve'}
                              </button>
                              <button
                                id={`btn-reject-${req.id}`}
                                onClick={() => handleReject(req.id)}
                                disabled={isRowLoading}
                                style={{
                                  padding: '0.4rem 0.875rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  border: '1px solid rgba(248,113,113,0.25)',
                                  background: 'rgba(248,113,113,0.08)',
                                  color: '#fca5a5',
                                  cursor: isRowLoading ? 'not-allowed' : 'pointer',
                                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                                  opacity: isRowLoading ? 0.5 : 1,
                                  fontFamily: 'inherit',
                                  transition: 'all 0.2s',
                                }}
                              >
                                {loadingStates[req.id] === 'rejecting'
                                  ? <span className="chronos-spinner" style={{ width: '0.875rem', height: '0.875rem', borderTopColor: '#fca5a5' }} />
                                  : <X style={{ width: '0.875rem', height: '0.875rem' }} />
                                }
                                {loadingStates[req.id] === 'rejecting' ? 'Rejecting...' : 'Reject'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* ── TAB: SWAPS ───────────────────────────────────── */
          <div className="glass-panel" style={{ borderRadius: '20px', overflow: 'hidden' }}>
            {swapRequests.length === 0 ? (
              <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                <Layers style={{ width: '2.5rem', height: '2.5rem', color: 'rgba(255,255,255,0.2)', margin: '0 auto 1rem' }} />
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                  No peer-to-peer hour swap requests have been raised yet.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: '1.5rem' }}>Requester</th>
                      <th>Colleague</th>
                      <th>Date</th>
                      <th>Period</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {swapRequests
                      .slice()
                      .sort((a, b) => (a.status === 'PendingAdmin' ? -1 : 1) - (b.status === 'PendingAdmin' ? -1 : 1))
                      .map((s) => {
                        const requester = faculties.find(f => f.id === s.requester_faculty_id);
                        const receiver = faculties.find(f => f.id === s.receiver_faculty_id);
                        const isActionable = s.status === 'PendingAdmin';

                        const statusColor =
                          s.status === 'Approved' ? { c: '#6ee7b7', b: 'rgba(52,211,153,0.35)', bg: 'rgba(52,211,153,0.12)' }
                          : s.status === 'Rejected' ? { c: '#fca5a5', b: 'rgba(248,113,113,0.25)', bg: 'rgba(248,113,113,0.08)' }
                          : s.status === 'PendingAdmin' ? { c: '#7dd3fc', b: 'rgba(56,189,248,0.3)', bg: 'rgba(56,189,248,0.1)' }
                          : { c: '#fcd34d', b: 'rgba(251,191,36,0.3)', bg: 'rgba(251,191,36,0.1)' };

                        const statusLabel =
                          s.status === 'PendingReceiver' ? 'Awaiting Colleague'
                          : s.status === 'PendingAdmin' ? 'Awaiting Admin'
                          : s.status;

                        return (
                          <tr key={s.id}>
                            <td style={{ paddingLeft: '1.5rem', fontWeight: 600, color: '#fff' }}>
                              {requester ? requester.name : 'Unknown'}
                            </td>
                            <td style={{ color: 'rgba(255,255,255,0.7)' }}>
                              {receiver ? receiver.name : 'Unknown'}
                            </td>
                            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                              {s.date}
                            </td>
                            <td style={{ color: 'rgba(255,255,255,0.7)' }}>Period {s.period}</td>
                            <td>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center',
                                padding: '0.2rem 0.6rem', borderRadius: '9999px',
                                fontSize: '0.7rem', fontWeight: 700,
                                border: `1px solid ${statusColor.b}`, background: statusColor.bg, color: statusColor.c,
                              }}>
                                {statusLabel}
                              </span>
                            </td>
                            <td style={{ paddingRight: '1.5rem', textAlign: 'right' }}>
                              {isActionable ? (
                                <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                                  <button
                                    id={`btn-approve-swap-${s.id}`}
                                    onClick={() => approveSwap(s.id)}
                                    style={{
                                      padding: '0.4rem 0.875rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700,
                                      border: '1px solid rgba(52,211,153,0.35)', background: 'rgba(52,211,153,0.12)', color: '#6ee7b7',
                                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', fontFamily: 'inherit',
                                    }}
                                  >
                                    <Check style={{ width: '0.875rem', height: '0.875rem' }} /> Approve
                                  </button>
                                  <button
                                    id={`btn-reject-swap-${s.id}`}
                                    onClick={() => rejectSwap(s.id)}
                                    style={{
                                      padding: '0.4rem 0.875rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700,
                                      border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.08)', color: '#fca5a5',
                                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', fontFamily: 'inherit',
                                    }}
                                  >
                                    <X style={{ width: '0.875rem', height: '0.875rem' }} /> Reject
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── GLASS FOOTER ────────────────────────────────────── */}
      <footer className="chronos-footer" style={{ marginTop: 'auto' }}>
        <div className="chronos-footer-inner">
          <span>Admin Portal Isolated Routing System © {new Date().getFullYear()}</span>
          <span className="mode-pill mode-pill-live">HOD Access</span>
        </div>
      </footer>
    </div>
  );
};

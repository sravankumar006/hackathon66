import React from 'react';
import { useSystem } from '../context/SystemContext';
import {
  LineChart,
  CalendarClock,
  Repeat,
  Users,
  TrendingUp,
  BarChart2,
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const {
    faculties,
    leaveRequests,
    substituteAllocations,
    swapRequests,
    substitutionRequests,
  } = useSystem();

  // ── Leave metrics ──────────────────────────────────────
  const totalLeaves = leaveRequests.length;
  const approvedLeaves = leaveRequests.filter((l) => l.status === 'Approved').length;
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'Pending').length;
  const rejectedLeaves = leaveRequests.filter((l) => l.status === 'Rejected').length;

  // ── Coverage metrics ───────────────────────────────────
  const coveredSlots = substituteAllocations.filter((a) => a.substitute_faculty_id !== null).length;
  const freeSlots = substituteAllocations.filter((a) => a.substitute_faculty_id === null).length;
  const totalSlots = coveredSlots + freeSlots;
  const coverageRate = totalSlots > 0 ? Math.round((coveredSlots / totalSlots) * 100) : 100;

  // ── Swap metrics ───────────────────────────────────────
  const totalSwaps = swapRequests.length;
  const approvedSwaps = swapRequests.filter((s) => s.status === 'Approved').length;

  // ── Substitution requests ──────────────────────────────
  const pendingSubReqs = (substitutionRequests || []).filter((r) => r.status === 'Pending').length;

  const statCards = [
    { label: 'Total Leave Requests', value: totalLeaves, sub: `${pendingLeaves} pending`, icon: CalendarClock },
    { label: 'Approved Leaves', value: approvedLeaves, sub: `${rejectedLeaves} rejected`, icon: TrendingUp },
    { label: 'Substitutions Covered', value: coveredSlots, sub: `${freeSlots} free periods`, icon: Users },
    { label: 'Hour Swaps', value: totalSwaps, sub: `${approvedSwaps} approved`, icon: Repeat },
  ];

  // Leave status distribution for the bar chart
  const statusDist = [
    { label: 'Approved', value: approvedLeaves, color: 'bg-emerald-500' },
    { label: 'Pending', value: pendingLeaves, color: 'bg-amber-500' },
    { label: 'Rejected', value: rejectedLeaves, color: 'bg-rose-500' },
  ];
  const maxStatus = Math.max(1, ...statusDist.map((s) => s.value));

  // Leaves by department
  const deptStats: Record<string, number> = {};
  faculties.forEach((f) => {
    if (!f.is_admin) deptStats[f.dept] = deptStats[f.dept] || 0;
  });
  leaveRequests.forEach((l) => {
    const fac = faculties.find((f) => f.id === l.faculty_id);
    if (fac && !fac.is_admin) {
      deptStats[fac.dept] = (deptStats[fac.dept] || 0) + 1;
    }
  });
  const deptEntries = Object.entries(deptStats).sort((a, b) => b[1] - a[1]);
  const maxDept = Math.max(1, ...deptEntries.map(([, v]) => v));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center">
            <LineChart className="w-6 h-6 text-indigo-400 mr-2" />
            Analytics
          </h1>
          <p className="text-slate-400 text-sm">
            Live operational telemetry across leaves, substitutions and hour swaps.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-850 px-3.5 py-2 rounded-xl text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Coverage success rate:
          <strong className="text-slate-100 ml-1">{coverageRate}%</strong>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-slate-900 border border-slate-850 p-5 rounded-xl text-left">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {stat.label}
                </span>
                <Icon className="w-4 h-4 text-indigo-400" />
              </div>
              <h4 className="text-2xl font-black text-slate-100">{stat.value}</h4>
              <p className="text-[11px] text-slate-500 mt-1">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leave status distribution */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl lg:col-span-2 text-left">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-6 flex items-center">
            <BarChart2 className="w-4 h-4 text-indigo-400 mr-2" />
            Leave Request Status Distribution
          </h3>

          {totalLeaves === 0 ? (
            <div className="py-12 border border-dashed border-slate-850 rounded-lg text-center text-slate-550 text-xs">
              No leave requests recorded yet.
            </div>
          ) : (
            <div className="flex items-end justify-around gap-6 h-56 pt-4">
              {statusDist.map((s) => (
                <div key={s.label} className="flex flex-col items-center justify-end flex-1 h-full">
                  <span className="text-sm font-black text-slate-200 mb-2">{s.value}</span>
                  <div
                    className={`w-full max-w-[80px] rounded-t-lg ${s.color} transition-all duration-500`}
                    style={{ height: `${(s.value / maxStatus) * 100}%`, minHeight: s.value > 0 ? '8px' : '0' }}
                  />
                  <span className="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coverage KPI */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl flex flex-col justify-between text-left">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-6 flex items-center">
              <TrendingUp className="w-4 h-4 text-indigo-400 mr-2" />
              Coverage Overview
            </h3>

            <div className="flex flex-col items-center py-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <path
                    d="M18 2.5 a 15.5 15.5 0 0 1 0 31 a 15.5 15.5 0 0 1 0 -31"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.5 a 15.5 15.5 0 0 1 0 31 a 15.5 15.5 0 0 1 0 -31"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3"
                    strokeDasharray={`${coverageRate}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-slate-100">{coverageRate}%</span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest">Covered</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-4 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Slots covered</span>
                <span className="font-mono font-bold text-slate-200">{coveredSlots}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Free periods</span>
                <span className="font-mono font-bold text-slate-200">{freeSlots}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Pending sub. requests</span>
                <span className="font-mono font-bold text-slate-200">{pendingSubReqs}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaves by department */}
      <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl text-left">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-6 flex items-center">
          <Users className="w-4 h-4 text-indigo-400 mr-2" />
          Leave Requests by Department
        </h3>

        {deptEntries.length === 0 ? (
          <div className="py-10 border border-dashed border-slate-850 rounded-lg text-center text-slate-550 text-xs">
            No department data available.
          </div>
        ) : (
          <div className="space-y-4">
            {deptEntries.map(([dept, count]) => (
              <div key={dept} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">{dept}</span>
                  <span className="font-mono text-slate-400 font-bold">
                    {count} {count === 1 ? 'request' : 'requests'}
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-850 overflow-hidden p-0.5">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(count / maxDept) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

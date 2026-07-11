import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { FileText, Search, Download, HelpCircle } from 'lucide-react';

type Severity = 'All' | 'Info' | 'Success' | 'Warning' | 'Error';

const typeToSeverity: Record<string, Exclude<Severity, 'All'>> = {
  info: 'Info',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
};

const severityStyle: Record<Exclude<Severity, 'All'>, string> = {
  Info: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
  Success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  Warning: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  Error: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
};

export const Activity: React.FC = () => {
  const { eventLogs } = useSystem();
  const [search, setSearch] = useState('');
  const [activeSeverity, setActiveSeverity] = useState<Severity>('All');

  const severities: Severity[] = ['All', 'Info', 'Success', 'Warning', 'Error'];

  const filteredLogs = eventLogs.filter((log) => {
    const severity = typeToSeverity[log.type] || 'Info';
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = activeSeverity === 'All' || severity === activeSeverity;
    return matchesSearch && matchesSeverity;
  });

  const handleExport = () => {
    if (eventLogs.length === 0) return;
    const rows = [
      ['Timestamp', 'Severity', 'Message'],
      ...eventLogs.map((l) => [l.timestamp, typeToSeverity[l.type] || 'Info', l.message]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chronos-activity-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center">
            <FileText className="w-6 h-6 text-indigo-400 mr-2" />
            Activity Log
          </h1>
          <p className="text-slate-400 text-sm">
            Chronological record of system actions during this session.
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={eventLogs.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 hover:text-slate-100 font-semibold rounded-lg text-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-900">
        <div className="flex bg-slate-900 border border-slate-850 p-1 rounded-lg self-start">
          {severities.map((sev) => (
            <button
              key={sev}
              onClick={() => setActiveSeverity(sev)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                activeSeverity === sev
                  ? 'bg-indigo-600 text-indigo-50 shadow'
                  : 'text-slate-450 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-2.5 pl-9 pr-4 bg-slate-900 border border-slate-850 hover:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-slate-200 text-xs placeholder-slate-550 transition outline-none"
          />
        </div>
      </div>

      {/* Logs table */}
      <div className="bg-slate-900 border border-slate-850 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-850 text-slate-500 bg-slate-950/30">
                <th className="py-3 px-4 font-bold uppercase tracking-wider w-24">Severity</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider w-32">Timestamp</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60">
              {filteredLogs.map((log) => {
                const severity = typeToSeverity[log.type] || 'Info';
                return (
                  <tr key={log.id} className="hover:bg-slate-950/30">
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${severityStyle[severity]}`}>
                        {severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-200">{log.message}</td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-16 text-center text-slate-550">
                    <div className="flex flex-col items-center justify-center">
                      <HelpCircle className="w-8 h-8 text-slate-650 mb-2" />
                      <p className="font-semibold">
                        {eventLogs.length === 0 ? 'No activity logs recorded yet.' : 'No logs match your filters.'}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-1">
                        System actions like leave approvals and swaps appear here automatically.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

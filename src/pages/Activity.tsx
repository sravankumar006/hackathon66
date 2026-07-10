import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  HelpCircle,
  Plus
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  component: string;
  message: string;
  severity: 'Info' | 'Success' | 'Warning';
  operator: string;
  ipAddress: string;
  payload: Record<string, any>;
}

export const Activity: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [activeSeverity, setActiveSeverity] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const severities = ['All', 'Info', 'Success', 'Warning'];

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleExport = () => {
    if (logs.length === 0) return;
    alert('Export completed.');
  };

  const handleAddLogPlaceholder = () => {
    const newId = crypto.randomUUID();
    const newLog: AuditLog = {
      id: newId,
      timestamp: new Date().toISOString(),
      component: 'System',
      message: 'Generic system activity log placeholder.',
      severity: 'Info',
      operator: 'user@console.local',
      ipAddress: '127.0.0.1',
      payload: { status: 'OK', code: 200 }
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) || 
                          log.component.toLowerCase().includes(search.toLowerCase()) ||
                          log.operator.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = activeSeverity === 'All' || log.severity === activeSeverity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center">
            <FileText className="w-6 h-6 text-indigo-400 mr-2" />
            Activity Log
          </h1>
          <p className="text-slate-400 text-sm">
            Read chronological records of system actions.
          </p>
        </div>

        {/* Export action */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddLogPlaceholder}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 hover:text-indigo-450 font-semibold rounded-lg text-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>

          <button
            onClick={handleExport}
            disabled={logs.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-350 hover:text-slate-200 font-semibold rounded-lg text-xs transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Export Logs</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-900">
        
        {/* Severity Tabs */}
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

        {/* Search Query input */}
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

      {/* Logs Table Area */}
      <div className="bg-slate-900 border border-slate-850 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-850 text-slate-500 bg-slate-950/30">
                <th className="py-3 px-4 font-bold uppercase tracking-wider w-16">Status</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider w-28">Timestamp</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider w-24">Component</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Log Message</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider w-36">Operator</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider w-10 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60">
              {filteredLogs.map((log) => {
                const isExpanded = expandedId === log.id;
                
                return (
                  <React.Fragment key={log.id}>
                    <tr 
                      className={`hover:bg-slate-850/10 cursor-pointer ${isExpanded ? 'bg-slate-850/5' : ''}`}
                      onClick={() => toggleExpand(log.id)}
                    >
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border bg-slate-500/5 text-slate-450 border-slate-850">
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-950 border border-slate-850 rounded text-slate-450">
                          {log.component}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-200 truncate max-w-sm sm:max-w-md">
                        {log.message}
                      </td>
                      <td className="py-3.5 px-4 text-slate-450 font-medium">
                        {log.operator}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(log.id);
                          }}
                          className="p-1 rounded bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-450 hover:text-slate-200 transition"
                        >
                          {isExpanded ? 'Hide' : 'Show'}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded payload */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="bg-slate-950/80 px-6 py-4.5 border-t border-b border-slate-850">
                          <div className="space-y-3.5 text-left">
                            <pre className="p-4 bg-slate-900 border border-slate-850 rounded-lg text-[10px] font-mono text-indigo-300 overflow-x-auto">
                              {JSON.stringify(log.payload, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-550">
                    <div className="flex flex-col items-center justify-center">
                      <HelpCircle className="w-8 h-8 text-slate-650 mb-2" />
                      <p className="font-semibold">No activity logs recorded.</p>
                      <p className="text-[10px] text-slate-600 mt-1">Click "Add Entry" to create a placeholder log.</p>
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

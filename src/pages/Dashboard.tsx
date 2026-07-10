import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Activity,
  Plus,
  Play,
  RotateCcw,
  Info
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle }) => (
  <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl flex flex-col justify-between hover:border-slate-800 transition">
    <div className="flex items-center justify-between mb-4">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</span>
      <div className="p-2 bg-slate-950 rounded-lg text-indigo-400 border border-slate-850">
        <Activity className="w-4 h-4" />
      </div>
    </div>
    <div>
      <h3 className="text-2xl font-bold text-slate-100 mb-1">{value}</h3>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [actionAStatus, setActionAStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [actionBStatus, setActionBStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleActionA = () => {
    setActionAStatus('loading');
    setTimeout(() => {
      setActionAStatus('success');
      setTimeout(() => setActionAStatus('idle'), 2000);
    }, 1000);
  };

  const handleActionB = () => {
    setActionBStatus('loading');
    setTimeout(() => {
      setActionBStatus('success');
      setTimeout(() => setActionBStatus('idle'), 2000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-400 text-sm">
            Welcome back, <span className="font-semibold text-indigo-400">{profile?.fullName || 'User'}</span>. Configure your workspace.
          </p>
        </div>
      </div>

      {/* Metrics Row Placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Metric A"
          value="--"
          subtitle="Placeholder value"
        />
        <MetricCard
          title="Metric B"
          value="--"
          subtitle="Placeholder value"
        />
        <MetricCard
          title="Metric C"
          value="--"
          subtitle="Placeholder value"
        />
        <MetricCard
          title="Metric D"
          value="--"
          subtitle="Placeholder value"
        />
      </div>

      {/* Template Warning Section */}
      <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl flex items-start gap-4">
        <div className="mt-0.5 p-1.5 bg-slate-950 text-indigo-400 border border-slate-850 rounded-lg">
          <Info className="w-5 h-5" />
        </div>
        <div className="text-left">
          <h4 className="text-sm font-bold text-slate-200">Alerts & Warnings</h4>
          <p className="text-xs text-slate-450 mt-1 leading-relaxed">
            Configure system alerts, warnings, and capacity threshold notifications based on your problem requirements.
          </p>
        </div>
      </div>

      {/* Grid: Actions & Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Operations Actions Panel */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">
              Quick Actions
            </h3>
            <p className="text-xs text-slate-500 mb-6">Trigger scripts or state updates dynamically.</p>

            <div className="space-y-4">
              {/* Action 1 */}
              <div>
                <button
                  disabled={actionAStatus !== 'idle'}
                  onClick={handleActionA}
                  className="w-full py-2.5 px-4 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-350 hover:text-indigo-400 font-semibold rounded-lg flex items-center justify-between text-xs transition duration-150 disabled:opacity-50"
                >
                  <span className="flex items-center">
                    <RotateCcw className={`w-3.5 h-3.5 mr-2 ${actionAStatus === 'loading' ? 'animate-spin' : ''}`} />
                    Action 1
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {actionAStatus === 'idle' && 'READY'}
                    {actionAStatus === 'loading' && 'PROCESSING...'}
                    {actionAStatus === 'success' && 'SUCCESS'}
                  </span>
                </button>
              </div>

              {/* Action 2 */}
              <div>
                <button
                  disabled={actionBStatus !== 'idle'}
                  onClick={handleActionB}
                  className="w-full py-2.5 px-4 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-350 hover:text-indigo-400 font-semibold rounded-lg flex items-center justify-between text-xs transition duration-150 disabled:opacity-50"
                >
                  <span className="flex items-center">
                    <Play className={`w-3.5 h-3.5 mr-2 ${actionBStatus === 'loading' ? 'animate-pulse' : ''}`} />
                    Action 2
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {actionBStatus === 'idle' && 'READY'}
                    {actionBStatus === 'loading' && 'PROCESSING...'}
                    {actionBStatus === 'success' && 'SUCCESS'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State Table */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">
                Data Tables & Instances
              </h3>
              <p className="text-xs text-slate-500">Bind your data models or clusters below.</p>
            </div>
            <button className="text-xs text-slate-500 hover:text-slate-400 font-semibold flex items-center bg-slate-950 border border-slate-850 px-2 py-1 rounded">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Entry
            </button>
          </div>

          <div className="py-12 border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-550 text-xs">
            <p className="font-semibold">No data records available.</p>
            <p className="text-[10px] mt-1">Bind your custom database entries or operational metrics here.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

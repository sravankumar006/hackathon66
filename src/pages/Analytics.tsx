import React, { useState } from 'react';
import { 
  LineChart, 
  Calendar,
  Filter,
  Info
} from 'lucide-react';

interface MetricDetail {
  label: string;
  value: string;
}

const mockChartData: Record<'24h' | '7d' | '30d', { labels: string[]; points: number[]; svgPath: string; areaPath: string }> = {
  '24h': {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    points: [0, 0, 0, 0, 0, 0, 0],
    svgPath: 'M 10 200 L 91.6 200 L 173.3 200 L 255 200 L 336.6 200 L 418.3 200 L 500 200',
    areaPath: 'M 10 200 L 91.6 200 L 173.3 200 L 255 200 L 336.6 200 L 418.3 200 L 500 200 L 500 200 L 10 200 Z'
  },
  '7d': {
    labels: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'],
    points: [0, 0, 0, 0, 0, 0, 0],
    svgPath: 'M 10 200 L 91.6 200 L 173.3 200 L 255 200 L 336.6 200 L 418.3 200 L 500 200',
    areaPath: 'M 10 200 L 91.6 200 L 173.3 200 L 255 200 L 336.6 200 L 418.3 200 L 500 200 L 500 200 L 10 200 Z'
  },
  '30d': {
    labels: ['W1', 'W2', 'W3', 'W4'],
    points: [0, 0, 0, 0],
    svgPath: 'M 10 200 L 173.3 200 L 336.6 200 L 500 200',
    areaPath: 'M 10 200 L 173.3 200 L 336.6 200 L 500 200 L 500 200 L 10 200 Z'
  }
};

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const activeData = mockChartData[timeRange];

  const statCards: MetricDetail[] = [
    { label: 'Data Point 1', value: '--' },
    { label: 'Data Point 2', value: '--' },
    { label: 'Data Point 3', value: '--' },
    { label: 'Data Point 4', value: '--' },
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center">
            <LineChart className="w-6 h-6 text-indigo-400 mr-2" />
            Analytics
          </h1>
          <p className="text-slate-400 text-sm">
            Monitor, inspect, and filter core operations telemetry details.
          </p>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex bg-slate-900 border border-slate-850 p-1 rounded-lg self-start md:self-auto">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => { setTimeRange(range); setHoverIndex(null); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                timeRange === range
                  ? 'bg-indigo-600 text-indigo-50 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Graphic Chart Card */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350">Data Trends</h3>
              <p className="text-xs text-slate-500">Visualization of metrics over selected timeframe.</p>
            </div>
          </div>

          {/* Core SVG Chart */}
          <div className="relative w-full h-[240px] mt-4 flex flex-col justify-between">
            {/* Chart SVG wrapper */}
            <svg 
              viewBox="0 0 500 200" 
              className="w-full h-[200px] overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="10" y1="50" x2="500" y2="50" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="10" y1="100" x2="500" y2="100" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="10" y1="150" x2="500" y2="150" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="10" y1="200" x2="500" y2="200" stroke="#334155" strokeWidth="1" />

              {/* Area Under Line (Gradient Fill) */}
              <path
                d={activeData.areaPath}
                fill="url(#chartGradient)"
                className="transition-all duration-300 ease-in-out"
              />

              {/* Indigo Line Path */}
              <path
                d={activeData.svgPath}
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300 ease-in-out"
              />

              {/* Interactive Circles / Anchors */}
              {activeData.points.map((pt, idx) => {
                const count = activeData.points.length;
                const xVal = count > 1 ? 10 + (idx * 490) / (count - 1) : 250;
                const yVal = 200 - (pt * 180) / 100;
                
                return (
                  <g 
                    key={idx} 
                    onMouseEnter={() => setHoverIndex(idx)} 
                    onMouseLeave={() => setHoverIndex(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={xVal}
                      cy={yVal}
                      r={hoverIndex === idx ? 7 : 4}
                      fill={hoverIndex === idx ? '#4f46e5' : '#1e1b4b'}
                      stroke="#6366f1"
                      strokeWidth="2"
                      className="transition-all duration-150"
                    />
                  </g>
                );
              })}
            </svg>

            {/* X-Axis labels */}
            <div className="flex justify-between px-2.5 text-[10px] font-bold text-slate-500 tracking-wider">
              {activeData.labels.map((lbl, idx) => (
                <span key={idx}>{lbl}</span>
              ))}
            </div>

            {/* Floating Detail Indicator */}
            {hoverIndex !== null && (
              <div 
                className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-2 text-xs font-semibold shadow-md animate-fade-in"
              >
                <span className="text-slate-450">{activeData.labels[hoverIndex]}:</span>
                <span className="text-indigo-400 font-bold">{activeData.points[hoverIndex]} Value</span>
              </div>
            )}
          </div>
        </div>

        {/* Info panel */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-1">Metrics Status</h3>
            <p className="text-xs text-slate-500 mb-6 font-medium">Bind diagnostic telemetry indexes below.</p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-slate-950 border border-slate-850 rounded-lg text-slate-500">
                <Info className="w-4 h-4 text-indigo-400" />
                <span className="text-xs">No status monitors configured.</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" /> Period: {timeRange === '24h' ? '24h' : timeRange === '7d' ? '7d' : '30d'}
            </span>
          </div>
        </div>
      </div>

      {/* Numerical Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-850 p-4.5 rounded-xl text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
              {stat.label}
            </span>
            <h4 className="text-lg font-bold text-slate-100 mb-1">{stat.value}</h4>
          </div>
        ))}
      </div>

      {/* Aggregate Routes table */}
      <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6 text-left">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 flex items-center">
              <Filter className="w-4 h-4 text-indigo-400 mr-2" />
              Route Telemetry
            </h3>
            <p className="text-xs text-slate-550">Specific endpoint mappings and active response metrics.</p>
          </div>
        </div>

        <div className="py-12 border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-550 text-xs">
          <p className="font-semibold">No route records available.</p>
          <p className="text-[10px] mt-1">Bind your custom system endpoints or query metrics here.</p>
        </div>
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { 
  Calendar, 
  Grid,
  BarChart2,
  TrendingUp,
  Award,
  Users,
  AlertCircle
} from 'lucide-react';

export const Explore: React.FC = () => {
  const { 
    faculties, 
    timetable, 
    leaveRequests, 
    substituteAllocations 
  } = useSystem();

  // Grid Controls
  const [viewType, setViewType] = useState<'class' | 'faculty'>('class');
  const [selectedClass, setSelectedClass] = useState('CSE-A');
  const [selectedFacultyId, setSelectedFacultyId] = useState('faculty-aris');
  const [selectedDate, setSelectedDate] = useState('2026-07-13'); // Defaults to Monday

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
  ];
  const periods = [1, 2, 3, 4, 5];

  // 1. DYNAMIC DATE CALCULATION FOR SELECTED DATE'S WEEK
  const parts = selectedDate.split('-');
  const selectedDateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const currentDayIndex = selectedDateObj.getDay(); // 0 = Sun, 1 = Mon, etc.
  
  // Calculate Monday of that week
  const mondayObj = new Date(selectedDateObj);
  const diff = currentDayIndex === 0 ? -6 : 1 - currentDayIndex; // adjust when day is sunday
  mondayObj.setDate(selectedDateObj.getDate() + diff);

  const weekDates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(mondayObj);
    d.setDate(mondayObj.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const getDayFormattedString = (dayIndex: number) => {
    const d = weekDates[dayIndex];
    if (!d) return '';
    const dateParts = d.split('-');
    return `${dateParts[1]}/${dateParts[2]}`; // MM/DD
  };

  // 2. ANALYTICS CALCULATIONS
  // Calculate Leave statistics by department
  const getDeptLeaveStats = () => {
    const stats: Record<string, number> = {
      'Computer Science': 0,
      'Electrical Eng': 0,
      'Mechanical Eng': 0
    };

    leaveRequests.forEach(l => {
      if (l.status !== 'Approved') return;
      const fac = faculties.find(f => f.id === l.faculty_id);
      if (!fac || !stats[fac.dept] === undefined) return;
      
      // Calculate days in leave
      const start = new Date(l.start_date);
      const end = new Date(l.end_date);
      const daysCount = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      if (stats[fac.dept] !== undefined) {
        stats[fac.dept] += daysCount;
      } else {
        stats[fac.dept] = daysCount;
      }
    });

    return stats;
  };

  const deptLeaveStats = getDeptLeaveStats();

  // Substitution counts
  const totalSubstitutedSlots = substituteAllocations.filter(a => a.substitute_faculty_id !== null).length;
  const totalFreeSlots = substituteAllocations.filter(a => a.substitute_faculty_id === null).length;
  const totalCoverRequired = totalSubstitutedSlots + totalFreeSlots;
  const successRate = totalCoverRequired > 0 ? Math.round((totalSubstitutedSlots / totalCoverRequired) * 100) : 100;

  // Substitute Leaderboard
  const getLeaderboard = () => {
    const counts: Record<string, number> = {};
    
    // Seed with all faculty members
    faculties.forEach(f => {
      if (!f.is_admin) counts[f.id] = 0;
    });

    substituteAllocations.forEach(a => {
      if (a.substitute_faculty_id && counts[a.substitute_faculty_id] !== undefined) {
        counts[a.substitute_faculty_id]++;
      }
    });

    return Object.entries(counts)
      .map(([id, count]) => {
        const fac = faculties.find(f => f.id === id);
        return { name: fac ? fac.name : 'Unknown', dept: fac ? fac.dept : '', count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  const leaderboard = getLeaderboard();

  return (
    <div className="space-y-6">
      
      {/* Page Title & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-900 text-left">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center">
            <Grid className="w-6 h-6 text-indigo-400 mr-2" />
            Timetable Explorer & Analytics
          </h1>
          <p className="text-slate-400 text-sm">
            View unified schedules and audit substitution metrics across academic departments.
          </p>
        </div>

        {/* Global Date & Selector controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Week Date Picker */}
          <div className="flex items-center space-x-2.5 bg-slate-900 border border-slate-850 px-3.5 py-1.5 rounded-xl">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <div className="text-left">
              <span className="block text-[8px] font-bold uppercase tracking-widest text-slate-500">View Week Of</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-slate-200 focus:outline-none p-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Toggle Type */}
          <div className="flex bg-slate-900 border border-slate-850 p-1 rounded-xl">
            <button
              onClick={() => setViewType('class')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                viewType === 'class'
                  ? 'bg-indigo-600 text-indigo-50 shadow-md'
                  : 'text-slate-400 hover:text-slate-250'
              }`}
            >
              Class View
            </button>
            <button
              onClick={() => setViewType('faculty')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                viewType === 'faculty'
                  ? 'bg-indigo-600 text-indigo-50 shadow-md'
                  : 'text-slate-400 hover:text-slate-250'
              }`}
            >
              Faculty Schedule
            </button>
          </div>

          {/* Secondary selection dropdown */}
          {viewType === 'class' ? (
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="py-2.5 px-3.5 bg-slate-900 border border-slate-850 rounded-xl text-slate-200 text-xs font-bold focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none appearance-none cursor-pointer"
            >
              <option value="CSE-A">CSE-A</option>
              <option value="CSE-B">CSE-B</option>
              <option value="ECE-A">ECE-A</option>
              <option value="ECE-B">ECE-B</option>
              <option value="MECH-A">MECH-A</option>
            </select>
          ) : (
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="py-2.5 px-3.5 bg-slate-900 border border-slate-850 rounded-xl text-slate-200 text-xs font-bold focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none appearance-none cursor-pointer"
            >
              {faculties.filter(f => !f.is_admin).map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.dept})</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Week Date Range Banner */}
      <div className="bg-slate-900/40 border border-slate-850/60 p-3 rounded-xl flex items-center justify-between text-xs text-slate-450 text-left">
        <span>
          Showing schedule for the week of: <strong className="text-slate-200">{weekDates[0]}</strong> to <strong className="text-slate-200">{weekDates[4]}</strong>
        </span>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
          All allocations reflect approved leaves dynamically
        </span>
      </div>

      {/* TIMETABLE GRID */}
      <div className="bg-slate-900 border border-slate-850 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs whitespace-nowrap min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-850 bg-slate-955/70 text-slate-450">
                <th className="py-4 px-4 font-bold uppercase tracking-wider w-28 border-r border-slate-850">Period / Day</th>
                {days.map((day, idx) => (
                  <th key={day} className="py-4 px-4 font-bold uppercase tracking-wider border-r border-slate-850 last:border-r-0">
                    {day} <span className="text-[10px] text-slate-500 font-medium font-mono">({getDayFormattedString(idx)})</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/50">
              {periods.map(period => (
                <tr key={period} className="hover:bg-slate-950/20">
                  {/* Period label column */}
                  <td className="py-4 px-4 font-black border-r border-slate-850 text-slate-400 bg-slate-955/20 flex flex-col justify-center h-20">
                    <span>Period {period}</span>
                    <span className="text-[9px] font-normal text-slate-650 mt-0.5 font-mono">
                      {period === 1 && '09:00 - 10:00'}
                      {period === 2 && '10:15 - 11:15'}
                      {period === 3 && '11:30 - 12:30'}
                      {period === 4 && '01:30 - 02:30'}
                      {period === 5 && '02:45 - 03:45'}
                    </span>
                  </td>

                  {/* Day columns */}
                  {days.map((day, dayIdx) => {
                    const cellDate = weekDates[dayIdx];
                    
                    if (viewType === 'class') {
                      // 1. CLASS VIEW LAYOUT
                      const slot = timetable.find(t => t.class_name === selectedClass && t.day === day && t.period === period);
                      
                      if (!slot) {
                        return (
                          <td key={day} className="py-3 px-4 border-r border-slate-850 last:border-r-0 text-slate-650 italic">
                            Empty
                          </td>
                        );
                      }

                      const origFaculty = faculties.find(f => f.id === slot.faculty_id);
                      
                      // Check for substitution allocation on this day/period
                      const allocation = substituteAllocations.find(a => 
                        a.date === cellDate && 
                        a.period === period && 
                        a.original_faculty_id === slot.faculty_id
                      );

                      if (allocation) {
                        if (allocation.substitute_faculty_id === null) {
                          // Unassigned "Free Period"
                          return (
                            <td key={day} className="py-3 px-4 border-r border-slate-850 last:border-r-0 bg-amber-500/5 text-left border-l-2 border-l-amber-500">
                              <span className="text-[9px] uppercase font-bold tracking-widest text-amber-500 font-mono">Free Period</span>
                              <p className="font-bold text-slate-200 mt-0.5">{slot.subject}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5 line-through">~~{origFaculty?.name}~~</p>
                            </td>
                          );
                        } else {
                          // Assigned Substitute
                          const subFaculty = faculties.find(f => f.id === allocation.substitute_faculty_id);
                          return (
                            <td key={day} className="py-3 px-4 border-r border-slate-850 last:border-r-0 bg-indigo-500/5 text-left border-l-2 border-l-indigo-500">
                              <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-400 font-mono">Substituted</span>
                              <p className="font-bold text-slate-200 mt-0.5">{slot.subject}</p>
                              <p className="text-[10px] text-slate-450 mt-0.5 font-semibold">Cover: {subFaculty?.name}</p>
                              <p className="text-[9px] text-slate-600 line-through">~~{origFaculty?.name}~~</p>
                            </td>
                          );
                        }
                      }

                      return (
                        <td key={day} className="py-3 px-4 border-r border-slate-850 last:border-r-0 text-left">
                          <p className="font-bold text-slate-250">{slot.subject}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{origFaculty?.name}</p>
                        </td>
                      );

                    } else {
                      // 2. FACULTY VIEW LAYOUT
                      // Check if scheduled regularly
                      const regSlot = timetable.find(t => t.faculty_id === selectedFacultyId && t.day === day && t.period === period);
                      
                      // Check if subbing for someone else
                      const subbingAlloc = substituteAllocations.find(a => 
                        a.date === cellDate && 
                        a.period === period && 
                        a.substitute_faculty_id === selectedFacultyId
                      );

                      // Check if replaced (on leave/swap)
                      const isReplaced = regSlot ? substituteAllocations.find(a => 
                        a.date === cellDate && 
                        a.period === period && 
                        a.original_faculty_id === selectedFacultyId
                      ) : null;

                      if (subbingAlloc) {
                        // Showing coverage class
                        const origFac = faculties.find(f => f.id === subbingAlloc.original_faculty_id);
                        const origSlot = timetable.find(t => t.faculty_id === subbingAlloc.original_faculty_id && t.day === day && t.period === period);
                        return (
                          <td key={day} className="py-3 px-4 border-r border-slate-850 last:border-r-0 bg-indigo-500/5 text-left border-l-2 border-l-indigo-500">
                            <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-400 font-mono">Substitution duty</span>
                            <p className="font-bold text-slate-200 mt-0.5">{origSlot?.class_name} ({origSlot?.subject})</p>
                            <p className="text-[10px] text-slate-450 mt-0.5">Covering for: {origFac?.name}</p>
                          </td>
                        );
                      }

                      if (regSlot) {
                        if (isReplaced) {
                          const subFac = faculties.find(f => f.id === isReplaced.substitute_faculty_id);
                          return (
                            <td key={day} className="py-3 px-4 border-r border-slate-850 last:border-r-0 bg-slate-900 opacity-50 text-left border-l-2 border-l-slate-700">
                              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono">
                                {isReplaced.substitute_faculty_id ? 'Absent (Covered)' : 'Absent (Free)'}
                              </span>
                              <p className="font-bold text-slate-400 mt-0.5">{regSlot.class_name} ({regSlot.subject})</p>
                              <p className="text-[10px] text-slate-550 mt-0.5">
                                {subFac ? `Covered by: ${subFac.name}` : 'Free Period'}
                              </p>
                            </td>
                          );
                        }

                        return (
                          <td key={day} className="py-3 px-4 border-r border-slate-850 last:border-r-0 text-left">
                            <p className="font-bold text-slate-250">{regSlot.class_name}</p>
                            <p className="text-[10px] text-slate-450 mt-0.5">{regSlot.subject}</p>
                          </td>
                        );
                      }

                      return (
                        <td key={day} className="py-3 px-4 border-r border-slate-850 last:border-r-0 text-slate-650 italic">
                          -
                        </td>
                      );
                    }
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REPORTS & ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        
        {/* Progress Bar statistics: Leaves by Department */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl text-left lg:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-6 flex items-center">
            <BarChart2 className="w-4.5 h-4.5 text-indigo-400 mr-2" />
            Monthly Leave Statistics by Department (July 2026)
          </h3>
          
          <div className="space-y-5">
            {Object.entries(deptLeaveStats).map(([dept, count]) => {
              // Calculate percent compared to a max limit, e.g. 10 days max for color filling
              const percent = Math.min((count / 10) * 100, 100);
              return (
                <div key={dept} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">{dept}</span>
                    <span className="font-mono text-slate-400 font-bold">{count} {count === 1 ? 'Day' : 'Days'} Approved</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-850 overflow-hidden p-0.5">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-550"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Aggregate warning */}
          <div className="mt-6 p-3.5 bg-slate-950 border border-slate-850 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 leading-relaxed">
              *Department leave calculations aggregate the cumulative leave duration for all approved requests. Load thresholds are calculated based on a maximum recommended operational limit of 10 department leave-days per month.
            </p>
          </div>
        </div>

        {/* Substitution KPIs & Top Contributors Leaderboard */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl flex flex-col justify-between text-left">
          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 flex items-center">
              <TrendingUp className="w-4.5 h-4.5 text-indigo-400 mr-2" />
              Coverage Analytics
            </h3>

            {/* Substitution Rate KPI */}
            <div className="p-4 bg-slate-955 border border-slate-850 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Substitution Success</span>
                <h4 className="text-xl font-black text-slate-200 mt-1">{successRate}%</h4>
              </div>
              
              {/* Circular SVG Indicator */}
              <svg className="w-12 h-12 transform -rotate-90">
                <circle cx="24" cy="24" r="18" className="stroke-slate-800" strokeWidth="3" fill="transparent" />
                <circle 
                  cx="24" 
                  cy="24" 
                  r="18" 
                  className="stroke-indigo-500" 
                  strokeWidth="3.5" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 18}
                  strokeDashoffset={2 * Math.PI * 18 * (1 - successRate / 100)}
                />
              </svg>
            </div>

            {/* Leaderboard of covering Faculty */}
            <div className="space-y-3">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Substitution Contributors</span>
              
              {leaderboard.length === 0 ? (
                <div className="py-4 border border-dashed border-slate-850 rounded-lg text-center text-slate-600 text-xs">
                  No substitution records.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {leaderboard.map((f, index) => (
                    <div key={f.name} className="flex items-center justify-between text-xs p-1.5 bg-slate-950/40 border border-slate-850/60 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded bg-indigo-500/5 text-indigo-400 border border-indigo-500/15 flex items-center justify-center font-bold text-[10px]">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-250 leading-none">{f.name}</p>
                          <span className="text-[9px] text-slate-550">{f.dept}</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-350 text-[10px]">{f.count} {f.count === 1 ? 'class' : 'classes'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-850/60 pt-3.5 mt-5 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center"><Award className="w-3.5 h-3.5 text-indigo-400 mr-1" /> Load Balanced</span>
            <span className="flex items-center"><Users className="w-3.5 h-3.5 text-indigo-400 mr-1" /> {totalSubstitutedSlots} Total Swaps</span>
          </div>
        </div>

      </div>

    </div>
  );
};

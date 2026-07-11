import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { 
  Settings as SettingsIcon, 
  User, 
  Mail, 
  Save, 
  LogOut, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Lock,
  BookOpen,
  Briefcase,
  RefreshCw
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, profile, updateProfile, signOut, isMockMode } = useAuth();
  const { currentFaculty, updateFacultyProfile, resetSystemState } = useSystem();
  
  const [fullName, setFullName] = useState('');
  const [dept, setDept] = useState('Computer Science');
  const [specialization, setSpecialization] = useState('General Eng');
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize input fields with current database profiles
  useEffect(() => {
    if (profile?.fullName) {
      setFullName(profile.fullName);
    } else if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
    
    if (currentFaculty) {
      setDept(currentFaculty.dept);
      setSpecialization(currentFaculty.specialization);
      setIsAdmin(currentFaculty.is_admin);
    }
  }, [profile, user, currentFaculty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    if (!fullName.trim()) {
      setError('Name field cannot be empty');
      setLoading(false);
      return;
    }

    try {
      // 1. Update auth details (name)
      const { error: err } = await updateProfile(fullName);
      if (err) {
        setError(err);
        setLoading(false);
        return;
      }
      
      // 2. Update academic system profile details
      updateFacultyProfile(dept, specialization, isAdmin);
      
      setSuccess('Profile configurations successfully updated.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all leaves, swaps, and allocations to original seed states?')) {
      resetSystemState();
      alert('Local storage data reset successfully.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="text-left">
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center">
          <SettingsIcon className="w-6 h-6 text-indigo-400 mr-2" />
          System Settings & Profile
        </h1>
        <p className="text-slate-400 text-sm">
          Modify your academic role parameters, department, specialization, and system configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Profile Card Form */}
        <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 text-left">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-5 border-b border-slate-850 pb-3">
            Academic Profile Settings
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start space-x-2.5 p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs">
                <AlertTriangle className="w-4.5 h-4.5 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start space-x-2.5 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs">
                <CheckCircle className="w-4.5 h-4.5 mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Email (Read Only) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Email Address (Read Only)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-600" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full py-2.5 pl-10 pr-4 bg-slate-950/60 border border-slate-850 text-slate-500 rounded-lg text-xs cursor-not-allowed outline-none font-medium"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Aris Vance"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-slate-200 text-xs placeholder-slate-600 transition outline-none"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Department
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <select
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-slate-200 text-xs transition outline-none appearance-none"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electrical Eng">Electrical Eng</option>
                  <option value="Mechanical Eng">Mechanical Eng</option>
                  <option value="Academic Administration">Academic Administration</option>
                </select>
              </div>
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Specialization / Primary Subject
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-slate-200 text-xs placeholder-slate-600 transition outline-none"
                />
              </div>
              <p className="text-[9px] text-slate-500 mt-1">This matches subjects in the class timetable for substitute ranking priorities.</p>
            </div>



            {/* Save Changes button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-indigo-50 font-semibold rounded-lg flex items-center justify-center space-x-2 text-xs transition duration-150 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    <span>Save Configurations</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Demo Controls Panel */}
        <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 text-left space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center mb-1">
              <RefreshCw className="w-4.5 h-4.5 text-amber-500 mr-2" />
              Demo State Management
            </h3>
            <p className="text-xs text-slate-450">
              Reset the database to restore the default schedules, faculty rosters, and clean pending logs for testing and presentation purposes.
            </p>
          </div>
          <button
            onClick={handleResetData}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/15 text-amber-500 font-bold rounded-lg text-xs transition duration-150"
          >
            <span>Reset Demo State Data</span>
          </button>
        </div>

        {/* Session / Credentials Management */}
        <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center mb-1">
              <Lock className="w-4.5 h-4.5 text-indigo-400 mr-2" />
              Auth & Credentials Session
            </h3>
            <p className="text-xs text-slate-455">
              {isMockMode 
                ? 'Your session is running in Mock Mode (using local memory persistence).' 
                : 'Your session is authenticated via real Supabase web token.'
              }
            </p>
          </div>

          <button
            onClick={signOut}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-500/10 border border-red-500/25 hover:bg-red-500/15 text-red-400 font-bold rounded-lg text-xs transition duration-150 shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout session</span>
          </button>
        </div>
      </div>
    </div>
  );
};

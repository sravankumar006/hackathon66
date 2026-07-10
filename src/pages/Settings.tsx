import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Settings as SettingsIcon, 
  User, 
  Mail, 
  Save, 
  LogOut, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Lock
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, profile, updateProfile, signOut, isMockMode } = useAuth();
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize input field with current metadata
  useEffect(() => {
    if (profile?.fullName) {
      setFullName(profile.fullName);
    } else if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [profile, user]);

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
      const { error: err } = await updateProfile(fullName);
      if (err) {
        setError(err);
      } else {
        setSuccess('Profile updated successfully.');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center">
          <SettingsIcon className="w-6 h-6 text-indigo-400 mr-2" />
          Account Settings
        </h1>
        <p className="text-slate-400 text-sm">
          Modify your display metadata, check login session channels, and manage credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Profile Card Form */}
        <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 text-left">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-5 border-b border-slate-850 pb-3">
            Profile Details
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
                Email Address (Primary Identity)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-655" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full py-2.5 pl-10 pr-4 bg-slate-950/60 border border-slate-850 text-slate-500 rounded-lg text-xs cursor-not-allowed outline-none font-medium"
                />
              </div>
              <p className="text-[10px] text-slate-600 mt-1">Your email address is managed via your identity provider credentials.</p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-slate-200 text-xs placeholder-slate-600 transition outline-none"
                />
              </div>
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
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Session / Credentials Management */}
        <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center mb-1">
              <Lock className="w-4.5 h-4.5 text-indigo-400 mr-2" />
              Auth & Session Session
            </h3>
            <p className="text-xs text-slate-450">
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

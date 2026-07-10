import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Activity, 
  TrendingUp, 
  Compass, 
  Mail, 
  Lock, 
  User, 
  ArrowLeft, 
  AlertTriangle, 
  Loader2,
  Cpu
} from 'lucide-react';

export const AuthStack: React.FC = () => {
  const { signIn, signUp, isMockMode } = useAuth();
  const [activeCard, setActiveCard] = useState<'intro' | 'auth'>('intro');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (authMode === 'signup' && !fullName) {
      setError('Please provide your full name');
      setLoading(false);
      return;
    }

    try {
      if (authMode === 'signin') {
        const { error: err } = await signIn(email, password);
        if (err) setError(err);
      } else {
        const { error: err } = await signUp(email, password, fullName);
        if (err) setError(err);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCardSwitch = (card: 'intro' | 'auth') => {
    setError(null);
    setActiveCard(card);
  };

  return (
    <div className="relative flex items-center justify-center min-h-[80vh] w-full px-4 overflow-hidden py-12">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Stack Container */}
      <div className="relative w-full max-w-lg h-[580px]">
        <AnimatePresence initial={false}>
          {/* CARD 1: Introduction (Top Card by default) */}
          {activeCard === 'intro' && (
            <motion.div
              key="intro-card"
              initial={{ scale: 1, y: 0, opacity: 1 }}
              animate={{ 
                scale: 1, 
                x: 0, 
                rotate: 0, 
                opacity: 1,
                zIndex: 20
              }}
              exit={{ 
                x: 480, 
                rotate: 15, 
                opacity: 0,
                scale: 0.95,
                zIndex: 10,
                transition: { type: 'spring', stiffness: 120, damping: 18 }
              }}
              className="absolute inset-0 flex flex-col justify-between p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-indigo-950/20"
            >
              <div>
                {/* Brand Header */}
                <div className="flex items-center space-x-3 mb-8">
                  <div className="p-2.5 bg-indigo-650 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/30">
                    <Cpu className="w-6 h-6 text-indigo-100" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-100">ApexOps</h2>
                    <p className="text-xs text-slate-400 font-medium">Enterprise Cloud Management</p>
                  </div>
                </div>

                {/* Tagline */}
                <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight leading-tight mb-4 text-left">
                  Streamline Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-indigo-300">
                    Cloud Infrastructure.
                  </span>
                </h1>
                
                <p className="text-sm text-slate-400 text-left mb-8">
                  Monitor core telemetry metrics, explore unified resources, inspect active system operations, and audit system activities from a singular dashboard.
                </p>

                {/* Features List */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 text-left">
                    <div className="mt-1 p-1 bg-slate-800/80 rounded-md">
                      <TrendingUp className="w-4 h-4 text-indigo-450" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">Real-time Analytics</h4>
                      <p className="text-xs text-slate-450">Inspect CPU loads, throughput, and system latencies dynamically.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 text-left">
                    <div className="mt-1 p-1 bg-slate-800/80 rounded-md">
                      <Compass className="w-4 h-4 text-indigo-450" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">Resource Discovery</h4>
                      <p className="text-xs text-slate-450">Find, search, and filter standard deployments and database clusters.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 text-left">
                    <div className="mt-1 p-1 bg-slate-800/80 rounded-md">
                      <Activity className="w-4 h-4 text-indigo-450" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">Audit Trails</h4>
                      <p className="text-xs text-slate-450">Track security logs and system activity across teams securely.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Get Started Button */}
              <button
                onClick={() => handleCardSwitch('auth')}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-750 text-indigo-50 font-semibold rounded-xl transition duration-200 shadow-lg shadow-indigo-655/20 hover:shadow-indigo-750/30 flex items-center justify-center space-x-2 text-sm"
              >
                <span>Get Started</span>
              </button>
            </motion.div>
          )}

          {/* CARD 2: Auth Form (Underneath / Slide In) */}
          {activeCard === 'auth' && (
            <motion.div
              key="auth-card"
              initial={{ scale: 0.95, opacity: 0, x: -60 }}
              animate={{ 
                scale: 1, 
                x: 0, 
                rotate: 0, 
                opacity: 1,
                zIndex: 20,
                transition: { type: 'spring', stiffness: 150, damping: 20 }
              }}
              exit={{ 
                scale: 0.95, 
                opacity: 0, 
                x: -60,
                zIndex: 10
              }}
              className="absolute inset-0 flex flex-col justify-between p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-indigo-950/20"
            >
              <div>
                {/* Back Link & Title */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => handleCardSwitch('intro')}
                    className="flex items-center space-x-1.5 text-slate-450 hover:text-slate-250 transition text-xs font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Intro</span>
                  </button>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {isMockMode ? 'MOCK AUTH ACTIVE' : 'SUPABASE AUTH'}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-slate-100 mb-1 text-left">
                  {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-xs text-slate-450 text-left mb-6">
                  {authMode === 'signin' 
                    ? 'Enter your credentials to access your operations dashboard.' 
                    : 'Sign up to deploy mock databases and view live logs.'
                  }
                </p>

                {/* Tab Switcher */}
                <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-lg mb-6 border border-slate-850">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signin'); setError(null); }}
                    className={`py-2 text-xs font-semibold rounded-md transition duration-150 ${
                      authMode === 'signin' 
                        ? 'bg-slate-805 text-slate-100 shadow-sm' 
                        : 'text-slate-450 hover:text-slate-250'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signup'); setError(null); }}
                    className={`py-2 text-xs font-semibold rounded-md transition duration-150 ${
                      authMode === 'signup' 
                        ? 'bg-slate-805 text-slate-100 shadow-sm' 
                        : 'text-slate-450 hover:text-slate-250'
                    }`}
                  >
                    Register
                  </button>
                </div>

                {/* Form Input fields */}
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-start space-x-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs text-left animate-shake">
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {authMode === 'signup' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 text-left">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Alex Morgan"
                          className="w-full py-2.5 pl-10 pr-4 bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-slate-200 text-sm placeholder-slate-600 transition outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 text-left">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full py-2.5 pl-10 pr-4 bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-slate-200 text-sm placeholder-slate-600 transition outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 text-left">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full py-2.5 pl-10 pr-4 bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-slate-200 text-sm placeholder-slate-600 transition outline-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-indigo-650 hover:bg-indigo-700 text-indigo-50 font-semibold rounded-lg transition duration-200 shadow-md shadow-indigo-950/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm mt-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        <span>{authMode === 'signin' ? 'Sign In Securely' : 'Complete Registration'}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Mode Specific Note */}
              <div className="text-[10px] text-slate-500 text-center">
                {isMockMode ? (
                  <p>Running in Mock Mode. Any credentials will simulate a successful login.</p>
                ) : (
                  <p>Connecting securely to live Supabase Authentication servers.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

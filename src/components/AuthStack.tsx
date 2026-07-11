import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { supabase } from '../supabaseClient';
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
  Calendar
} from 'lucide-react';

export const AuthStack: React.FC = () => {
  const { signIn, signUp, isMockMode } = useAuth();
  const { setCurrentPage } = useSystem();
  const [activeCard, setActiveCard] = useState<'intro' | 'auth'>('intro');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [roleSelection, setRoleSelection] = useState<'Faculty' | 'Admin'>('Faculty');
  
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
        if (err) {
          setError(err);
          setLoading(false);
          return;
        }

        // Successfully logged in! Validate the user's role
        let is_admin = false;
        if (isMockMode) {
          // Mock mode: match default emails
          if (email.toLowerCase() === 'admin@university.edu') {
            is_admin = true;
          } else if (email.toLowerCase() === 'aris@university.edu') {
            is_admin = false;
          } else {
            is_admin = email.toLowerCase().includes('admin');
          }
        } else if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          const authUser = session?.user;
          if (authUser) {
            let { data: facultyData, error: dbError } = await supabase
              .from('faculty')
              .select('*')
              .eq('id', authUser.id)
              .single();

            // Fallback to email query for seed data matching
            if (dbError || !facultyData) {
              const { data: emailData } = await supabase
                .from('faculty')
                .select('*')
                .eq('email', authUser.email?.toLowerCase())
                .single();
              facultyData = emailData;
            }

            if (facultyData) {
              is_admin = facultyData.is_admin;
            } else {
              is_admin = authUser.user_metadata?.is_admin || authUser.email?.toLowerCase().includes('admin') || false;
            }
          }
        }

        // Role enforcement logic
        if (is_admin) {
          setCurrentPage('admin_dashboard');
        } else if (roleSelection === 'Admin') {
          // Regular faculty member attempting to log in to the admin portal
          if (supabase) {
            await supabase.auth.signOut();
          }
          localStorage.removeItem('apexops_mock_session');
          setError('Access Denied: Invalid role privileges.');
          setLoading(false);
          return;
        } else {
          setCurrentPage('dashboard');
        }

      } else {
        const { error: err } = await signUp(email, password, fullName, roleSelection === 'Admin');
        if (err) {
          setError(err);
          setLoading(false);
          return;
        }
        // Redirect based on role on signup
        const resolvedIsAdmin = roleSelection === 'Admin' || email.toLowerCase().includes('admin');
        if (resolvedIsAdmin) {
          setCurrentPage('admin_dashboard');
        } else {
          setCurrentPage('dashboard');
        }
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
      <div className="relative flex flex-col items-center justify-center min-h-[80vh] w-full px-4 py-12">

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
              className="track-card absolute inset-0 flex flex-col justify-between"
            >
              <div>
                {/* Brand Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '2rem' }}>
                  <div style={{ padding: '0.625rem', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <Calendar style={{ width: '1.5rem', height: '1.5rem', color: '#fff' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: 0 }}>Chronos</h2>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', margin: 0, fontWeight: 500 }}>Leave & Timetable Management</p>
                  </div>
                </div>

                {/* Tagline */}
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1rem', textAlign: 'left' }}>
                  Automate Your{' '}<br />
                  <span style={{ background: 'linear-gradient(90deg, #a3e635, #17a2b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Academic Operations.
                  </span>
                </h1>
                
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', textAlign: 'left', marginBottom: '2rem' }}>
                  Manage faculty leave requests, automate timetable substitutions, and monitor department availability from a unified dashboard.
                </p>

                {/* Features List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ marginTop: '2px', padding: '0.25rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}>
                      <TrendingUp style={{ width: '1rem', height: '1rem', color: 'rgba(255,255,255,0.8)' }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', margin: 0 }}>Smart Allocations</h4>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Automatically find substitutes matching department and specialization.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ marginTop: '2px', padding: '0.25rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}>
                      <Compass style={{ width: '1rem', height: '1rem', color: 'rgba(255,255,255,0.8)' }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', margin: 0 }}>Live Timetables</h4>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>View real-time class schedules and faculty availability.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ marginTop: '2px', padding: '0.25rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}>
                      <Activity style={{ width: '1rem', height: '1rem', color: 'rgba(255,255,255,0.8)' }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', margin: 0 }}>Peer Swaps</h4>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Request and approve period swaps with fellow faculty members.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Get Started Button */}
              <button
                onClick={() => handleCardSwitch('auth')}
              className="btn btn-primary" style={{ width: '100%', borderRadius: '14px', marginTop: '1rem' }}
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
              className="track-card absolute inset-0 flex flex-col justify-between"
            >
              <div>
                {/* Back Link & Title */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => handleCardSwitch('intro')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'rgba(255,255,255,0.55)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, fontFamily: 'inherit' }}
                  >
                    <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
                    Back to Intro
                  </button>
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', padding: '0.2rem 0.625rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    {isMockMode ? 'MOCK AUTH' : 'SUPABASE AUTH'}
                  </span>
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem', textAlign: 'left' }}>
                  {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textAlign: 'left', marginBottom: '1.25rem' }}>
                  {authMode === 'signin' 
                    ? 'Enter your credentials to access your operations dashboard.' 
                    : 'Sign up to manage leaves and view timetables.'
                  }
                </p>

                {/* Tab Switcher */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', padding: '0.3rem', background: 'rgba(255,255,255,0.07)', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <button type="button" onClick={() => { setAuthMode('signin'); setError(null); }}
                    style={{ padding: '0.5rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: '9px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', background: authMode === 'signin' ? 'rgba(255,255,255,0.18)' : 'transparent', color: authMode === 'signin' ? '#fff' : 'rgba(255,255,255,0.45)' }}>
                    Sign In
                  </button>
                  <button type="button" onClick={() => { setAuthMode('signup'); setError(null); }}
                    style={{ padding: '0.5rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: '9px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', background: authMode === 'signup' ? 'rgba(255,255,255,0.18)' : 'transparent', color: authMode === 'signup' ? '#fff' : 'rgba(255,255,255,0.45)' }}>
                    Register
                  </button>
                </div>

                {/* Form Input fields */}
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {error && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', padding: '0.75rem', borderRadius: '10px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#fca5a5', fontSize: '0.8rem', textAlign: 'left' }} className="animate-shake">
                      <AlertTriangle style={{ width: '1rem', height: '1rem', marginTop: '1px', flexShrink: 0 }} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                      Portal Role Selection
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', padding: '0.3rem', background: 'rgba(255,255,255,0.07)', borderRadius: '12px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <button type="button" onClick={() => setRoleSelection('Faculty')}
                        style={{ padding: '0.5rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: '9px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', background: roleSelection === 'Faculty' ? 'rgba(255,255,255,0.18)' : 'transparent', color: roleSelection === 'Faculty' ? '#fff' : 'rgba(255,255,255,0.45)' }}>
                        Faculty Portal
                      </button>
                      <button type="button" onClick={() => setRoleSelection('Admin')}
                        style={{ padding: '0.5rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: '9px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', background: roleSelection === 'Admin' ? 'rgba(255,255,255,0.18)' : 'transparent', color: roleSelection === 'Admin' ? '#fff' : 'rgba(255,255,255,0.45)' }}>
                        Admin Portal
                      </button>
                    </div>
                  </div>

                  {authMode === 'signup' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Full Name</label>
                      <div style={{ position: 'relative' }}>
                        <User style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'rgba(255,255,255,0.35)' }} />
                        <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Alex Morgan" className="glass-input" style={{ paddingLeft: '2.5rem' }} />
                      </div>
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'rgba(255,255,255,0.35)' }} />
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="glass-input" style={{ paddingLeft: '2.5rem' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'rgba(255,255,255,0.35)' }} />
                      <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="glass-input" style={{ paddingLeft: '2.5rem' }} />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', borderRadius: '14px', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.6 : 1 }}>
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
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
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

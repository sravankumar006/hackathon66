import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { motion, AnimatePresence } from 'framer-motion';

export type PageId = 'dashboard' | 'leaves' | 'explore' | 'analytics' | 'activity' | 'settings';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, setCurrentPage }) => {
  const { isMockMode, signOut } = useAuth();
  const { currentFaculty } = useSystem();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Operations', shortLabel: 'Dashboard' },
    { id: 'leaves',    label: 'Leave & Swaps',          shortLabel: 'Leaves'    },
    { id: 'explore',   label: 'Timetable Explorer',     shortLabel: 'Explore'   },
    { id: 'analytics', label: 'Analytics',              shortLabel: 'Analytics' },
    { id: 'activity',  label: 'Activity Log',           shortLabel: 'Activity'  },
    { id: 'settings',  label: 'Profile & Settings',     shortLabel: 'Settings'  },
  ] as const;

  const handleNavClick = (pageId: PageId) => {
    setCurrentPage(pageId);
    setIsMenuOpen(false);
  };

  return (
    <div className="chronos-app-shell">

      {/* ── GLASS NAV BAR ───────────────────────────────────── */}
      <header className="chronos-app-nav">
        <div className="chronos-app-nav-inner">

          {/* Left: Hamburger + Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              id="btn-open-menu"
              onClick={() => setIsMenuOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              title="Open navigation menu"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <span className="brand" style={{ fontSize: '1.2rem' }}>Chronos</span>
          </div>

          {/* Centre: Inline nav links (desktop) */}
          <nav style={{ display: 'flex', gap: '0.25rem' }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`chronos-nav-link${currentPage === item.id ? ' active' : ''}`}
              >
                {item.shortLabel}
              </button>
            ))}
          </nav>

          {/* Right: Faculty badge + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {currentFaculty && (
              <span
                className="badge"
                style={{ marginBottom: 0, fontSize: '0.7rem' }}
              >
                {currentFaculty.is_admin ? '✦ Admin' : currentFaculty.name}
              </span>
            )}
            {signOut && (
              <button
                id="btn-signout"
                onClick={() => signOut()}
                className="chronos-nav-link"
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── SLIDE-OUT DRAWER ────────────────────────────────── */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(11,21,40,0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 40,
              }}
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="chronos-drawer"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100%',
                width: '100%',
                maxWidth: '300px',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                padding: '1.75rem',
              }}
            >
              {/* Drawer header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <span className="brand" style={{ fontSize: '1.2rem' }}>Chronos</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    color: 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                    width: '2rem',
                    height: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Profile card in drawer */}
              {currentFaculty && (
                <div
                  className="track-card"
                  style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', borderRadius: '16px' }}
                >
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                    {currentFaculty.name}
                  </p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)' }}>
                    {currentFaculty.dept} · {currentFaculty.specialization}
                  </p>
                  {currentFaculty.is_admin && (
                    <span className="badge" style={{ marginTop: '0.75rem', marginBottom: 0 }}>Admin</span>
                  )}
                </div>
              )}

              {/* Nav links */}
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1 }}>
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`chronos-nav-link${currentPage === item.id ? ' active' : ''}`}
                    style={{
                      textAlign: 'left',
                      borderRadius: '12px',
                      padding: '0.75rem 1rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* Drawer footer */}
              {signOut && (
                <button
                  onClick={() => signOut()}
                  className="btn btn-secondary"
                  style={{ marginTop: '1.5rem', fontSize: '0.875rem', padding: '0.75rem 1.25rem', width: '100%', borderRadius: '14px' }}
                >
                  Sign Out
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <main className="chronos-main">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </main>

      {/* ── GLASS FOOTER ─────────────────────────────────────── */}
      <footer className="chronos-footer">
        <div className="chronos-footer-inner">
          <span>© {new Date().getFullYear()} Chronos Faculty Automation Platform</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className={`mode-pill ${isMockMode ? 'mode-pill-mock' : 'mode-pill-live'}`}>
              {isMockMode ? 'Mock Mode' : 'Live Database'}
            </span>
            {currentFaculty && (
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>
                {currentFaculty.name} · {currentFaculty.dept}
              </span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

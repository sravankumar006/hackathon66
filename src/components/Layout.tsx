import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Menu,
  X,
  LayoutDashboard, 
  LineChart, 
  Compass, 
  FileText, 
  Settings as SettingsIcon, 
  LogOut,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type PageId = 'dashboard' | 'analytics' | 'explore' | 'activity' | 'settings';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, setCurrentPage }) => {
  const { signOut, isMockMode } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'activity', label: 'Activity', icon: FileText },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ] as const;

  const handleNavClick = (pageId: PageId) => {
    setCurrentPage(pageId);
    setIsMenuOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-650/40">
      
      {/* Clean Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Hamburger menu button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 -ml-2 rounded-lg bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-200 transition"
            title="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Center/Right: Empty spacing keeping it clean */}
          <div className="flex items-center space-x-2">
            {/* Optional badge or status indicator if desired, otherwise empty */}
          </div>
        </div>
      </header>

      {/* Navigation Drawer Menu (Slide out from Left) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/80 z-40 backdrop-blur-sm"
            />

            {/* Sidebar drawer content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-full max-w-xs bg-slate-900 border-r border-slate-800 shadow-2xl p-6 z-50 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Navigation Menu</span>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 rounded-md bg-slate-950 border border-slate-850 text-slate-450 hover:text-slate-250 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Nav Links List */}
                <nav className="flex flex-col space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition text-left ${
                          isActive 
                            ? 'text-indigo-400 bg-slate-950 border-l-2 border-indigo-500' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-450'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                {/* Logout Action */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition duration-150"
                >
                  <LogOut className="w-4.5 h-4.5" />
                  <span>Logout Session</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full"
        >
          {children}
        </motion.div>
      </main>

      {/* Persistent Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-955 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} Console. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-6">
            <a href="#docs" className="hover:text-slate-350 transition">Docs</a>
            <a href="#api" className="hover:text-slate-350 transition">API</a>
            <a href="#support" className="hover:text-slate-350 transition">Support</a>
          </div>

          {/* System Mode Indicator */}
          <div className="flex items-center space-x-2">
            {isMockMode ? (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/5 border border-amber-500/20 text-amber-500 font-medium">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                <span>Mock Mode</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 font-medium">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                <span>Supabase Live Auth</span>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

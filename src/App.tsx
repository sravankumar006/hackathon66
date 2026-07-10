import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthStack } from './components/AuthStack';
import { Layout } from './components/Layout';
import type { PageId } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { Explore } from './pages/Explore';
import { Activity } from './pages/Activity';
import { Settings } from './pages/Settings';
import { Cpu } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-16 h-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <Cpu className="w-6 h-6 text-indigo-400 animate-pulse" />
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-450 uppercase font-bold tracking-widest">ApexOps Gateway</p>
          <p className="text-[10px] text-slate-600 mt-1">Initializing secure credentials channel...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated Flow
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <AuthStack />
      </div>
    );
  }

  // Authenticated Flow
  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'analytics' && <Analytics />}
      {currentPage === 'explore' && <Explore />}
      {currentPage === 'activity' && <Activity />}
      {currentPage === 'settings' && <Settings />}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;

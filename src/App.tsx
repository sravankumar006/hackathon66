import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SystemProvider } from './context/SystemContext';
import { Layout } from './components/Layout';
import type { PageId } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { LeaveSwaps } from './pages/LeaveSwaps';
import { Explore } from './pages/Explore';
import { Analytics } from './pages/Analytics';
import { Activity } from './pages/Activity';
import { Settings } from './pages/Settings';
import { Landing } from './pages/Landing';
import { AuthStack } from './components/AuthStack';
import { AdminDashboard } from './pages/AdminDashboard';

import { useSystem } from './context/SystemContext';

const MainAppContent: React.FC = () => {
  const { currentPage, setCurrentPage } = useSystem();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="chronos-canvas hero-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="chronos-spinner" />
      </div>
    );
  }

  if (currentPage === 'landing') {
    return (
      <Landing 
        onEnter={(page) => {
          setCurrentPage(page as PageId);
        }} 
      />
    );
  }

  // Auth Gate: Show login page if not authenticated
  if (!user) {
    return (
      <div className="chronos-canvas hero-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="track-card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2rem' }}>
          <AuthStack />
        </div>
        <button
          onClick={() => setCurrentPage('landing')}
          style={{
            marginTop: '1.25rem',
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.5)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontFamily: 'inherit',
          }}
        >
          ← Back to Landing Page
        </button>
      </div>
    );
  }

  // Admin Portal Workspace Layout
  if (currentPage === 'admin_dashboard') {
    return <AdminDashboard />;
  }

  return (
    <Layout currentPage={currentPage as PageId} setCurrentPage={setCurrentPage}>
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'leaves' && <LeaveSwaps />}
      {currentPage === 'explore' && <Explore />}
      {currentPage === 'analytics' && <Analytics />}
      {currentPage === 'activity' && <Activity />}
      {currentPage === 'settings' && <Settings />}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <SystemProvider>
        <MainAppContent />
      </SystemProvider>
    </AuthProvider>
  );
}

export default App;

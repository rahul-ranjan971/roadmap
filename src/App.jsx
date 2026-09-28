import React, { useEffect } from 'react';
import { Compass } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { usePath } from './utils/router';

import { Sidebar } from './components/Navigation/Sidebar';
import { TopNav } from './components/Navigation/TopNav';
import { MobileNav } from './components/Navigation/MobileNav';
import { SearchModal } from './components/Modals/SearchModal';
import { MotivationalIntroModal } from './components/Modals/MotivationalIntroModal';
import { ToastContainer } from './components/UI/ToastContainer';

import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

import { Dashboard } from './pages/Dashboard';
import { TodayPlan } from './pages/TodayPlan';
import { Roadmap } from './pages/Roadmap';
import { PracticeArcade } from './pages/PracticeArcade';
import { RevisionCenter } from './pages/RevisionCenter';
import { ProjectLab } from './pages/ProjectLab';
import { CareerPaths } from './pages/CareerPaths';
import { DsaPage } from './pages/DsaPage';
import { CoreCsPage } from './pages/CoreCsPage';
import { PythonPage } from './pages/PythonPage';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

const VALID_TABS = [
  'dashboard',
  'today',
  'roadmap',
  'practice',
  'revision',
  'projects',
  'careers',
  'dsa',
  'core-cs',
  'python',
  'analytics',
  'settings',
];

function BrandLoading() {
  return (
    <div className="min-h-screen bg-[#090a0f] flex flex-col items-center justify-center p-4 selection:bg-indigo-500/30">
      <div className="flex flex-col items-center space-y-3">
        <div className="p-3.5 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 shadow-inner">
          <Compass className="w-9 h-9 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-white tracking-tight">Career Compass</p>
          <p className="text-[11px] text-gray-500 font-mono mt-0.5">Initializing session...</p>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { loading, isAuthenticated } = useAuth();
  const [path, goTo] = usePath();
  const { activeTab, setActiveTab } = useApp();

  // Sync activeTab when user navigates directly via URL or browser history
  useEffect(() => {
    if (!isAuthenticated) return;
    const clean = path.replace(/^\//, '');
    if (VALID_TABS.includes(clean) && clean !== activeTab) {
      setActiveTab(clean);
    } else if ((clean === '' || clean === 'dashboard') && activeTab !== 'dashboard') {
      setActiveTab('dashboard');
    }
  }, [path, isAuthenticated, activeTab, setActiveTab]);

  // Prevent flash of content during initial auth resolution
  if (loading) {
    return <BrandLoading />;
  }

  // Unauthenticated user flow
  if (!isAuthenticated) {
    if (path === '/signup') return <Signup />;
    if (path === '/forgot-password') return <ForgotPassword />;
    if (path === '/reset-password') return <ResetPassword />;

    if (path !== '/login') {
      goTo('/login', { replace: true });
    }
    return <Login />;
  }

  // Authenticated user on auth routes -> redirect to dashboard
  if (path === '/login' || path === '/signup' || path === '/forgot-password') {
    goTo('/dashboard', { replace: true });
    return null;
  }

  // Password recovery for authenticated user
  if (path === '/reset-password') {
    return <ResetPassword />;
  }

  // Render active dashboard tab
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'today':
        return <TodayPlan />;
      case 'roadmap':
        return <Roadmap />;
      case 'practice':
        return <PracticeArcade />;
      case 'revision':
        return <RevisionCenter />;
      case 'projects':
        return <ProjectLab />;
      case 'careers':
        return <CareerPaths />;
      case 'dsa':
        return <DsaPage />;
      case 'core-cs':
        return <CoreCsPage />;
      case 'python':
        return <PythonPage />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <TopNav />

          {/* Page View Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 lg:pb-8 min-w-0">
            {renderActiveTab()}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Search Modal */}
      <SearchModal />

      {/* Motivational Loading / Intro Modal */}
      <MotivationalIntroModal />

      {/* Global Progress Feedback Toasts */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Navigation/Sidebar';
import { TopNav } from './components/Navigation/TopNav';
import { MobileNav } from './components/Navigation/MobileNav';
import { SearchModal } from './components/Modals/SearchModal';
import { MotivationalIntroModal } from './components/Modals/MotivationalIntroModal';
import { ToastContainer } from './components/UI/ToastContainer';

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

function AppContent() {
  const { activeTab } = useApp();

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

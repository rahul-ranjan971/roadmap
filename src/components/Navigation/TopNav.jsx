import React, { useState } from 'react';
import {
  Search,
  Quote,
  Flame,
  Menu,
  X,
  Compass,
  LayoutDashboard,
  Map,
  CalendarCheck,
  Gamepad2,
  Repeat,
  FolderGit2,
  Briefcase,
  Binary,
  Cpu,
  FileCode,
  BarChart3,
  Settings,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function TopNav() {
  const { activeTab, setActiveTab, stats, streaks, setSearchOpen, setIntroOpen } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabLabels = {
    dashboard: 'Command Center',
    today: "Today's Mission",
    roadmap: '120-Day Interactive Roadmap',
    practice: 'Interactive Practice Arcade',
    revision: 'Revision Center & Spaced Repetition',
    projects: 'Project Lab (13 Flagships)',
    careers: 'Career Paths Explorer',
    dsa: 'DSA with C++ Master Tracker',
    'core-cs': 'Core Software Engineering',
    python: 'Python Track & Data/AI',
    analytics: 'Learning Analytics & Metrics',
    settings: 'Settings & Data Backup',
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'today', label: "Today's Plan", icon: CalendarCheck },
    { id: 'roadmap', label: 'Roadmap', icon: Map },
    { id: 'practice', label: 'Practice Arcade', icon: Gamepad2 },
    { id: 'revision', label: 'Revision Center', icon: Repeat },
    { id: 'projects', label: 'Project Lab', icon: FolderGit2 },
    { id: 'careers', label: 'Career Paths', icon: Briefcase },
    { id: 'dsa', label: 'DSA with C++', icon: Binary },
    { id: 'core-cs', label: 'Core CS', icon: Cpu },
    { id: 'python', label: 'Python Track', icon: FileCode },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="h-16 border-b border-white/5 bg-[#0b0d14]/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
      {/* Left: Active Section & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse hidden sm:block" />
          <h2 className="text-sm md:text-base font-semibold text-white tracking-tight">
            {tabLabels[activeTab] || 'Dashboard'}
          </h2>
        </div>
      </div>

      {/* Middle: Day & Phase Pill (Desktop) */}
      <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-full text-xs text-gray-300">
        <span className="font-semibold text-white">Day {stats.currentDay.day}</span>
        <span className="text-gray-500">•</span>
        <span className="text-gray-400">Week {stats.currentDay.week}</span>
        <span className="text-gray-500">•</span>
        <span className="text-indigo-400 font-medium">{stats.currentPhase.name}</span>
      </div>

      {/* Right: Actions (Search, Quote, Streak) */}
      <div className="flex items-center gap-2">
        {/* Global Search Button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-xs"
          title="Search anything (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] bg-black/40 rounded border border-white/10 text-gray-400">
            Ctrl+K
          </kbd>
        </button>

        {/* Motivational Quote Button */}
        <button
          onClick={() => setIntroOpen(true)}
          className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-colors"
          title="Daily Inspiration & Mission"
          aria-label="View daily motivation quote"
        >
          <Quote className="w-4 h-4" />
        </button>

        {/* Mobile Streak Counter */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-semibold">
          <Flame className="w-3.5 h-3.5" />
          <span>{streaks.current}</span>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-[#0c0e17] border-b border-white/10 shadow-2xl p-4 max-h-[85vh] overflow-y-auto z-40">
          <div className="flex items-center gap-3 p-3 mb-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
            <Compass className="w-5 h-5" />
            <div>
              <div className="text-xs font-bold">CAREER COMPASS</div>
              <div className="text-[11px] text-gray-400">Day {stats.currentDay.day} • {stats.currentPhase.name}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium text-left transition-colors ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-gray-400" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

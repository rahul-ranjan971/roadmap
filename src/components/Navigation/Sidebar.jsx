import React from 'react';
import {
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
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Sidebar() {
  const { activeTab, setActiveTab, stats, streaks } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'today', label: "Today's Plan", icon: CalendarCheck, badge: `Day ${stats.currentDay.day}` },
    { id: 'roadmap', label: 'Roadmap', icon: Map, count: `${stats.completedDays}/120` },
    { id: 'practice', label: 'Practice Arcade', icon: Gamepad2, count: `${stats.completedPractice}/28` },
    { id: 'revision', label: 'Revision Center', icon: Repeat },
    { id: 'projects', label: 'Project Lab', icon: FolderGit2, count: `${stats.completedMilestones}/81` },
    { id: 'careers', label: 'Career Paths', icon: Briefcase, count: '12' },
    { id: 'dsa', label: 'DSA with C++', icon: Binary },
    { id: 'core-cs', label: 'Core Software', icon: Cpu },
    { id: 'python', label: 'Python Track', icon: FileCode },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-[#0b0d14] flex flex-col shrink-0 h-screen sticky top-0 hidden lg:flex select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
          <Compass className="w-5 h-5 animate-spin-slow" />
        </div>
        <div>
          <div className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
            CAREER COMPASS
          </div>
          <div className="text-[11px] text-gray-400 font-mono tracking-wider">
            120-DAY CAREER OS
          </div>
        </div>
      </div>

      {/* Streak / Mini Status */}
      <div className="mx-4 my-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-medium text-amber-200">Study Streak</span>
        </div>
        <div className="text-xs font-bold font-mono text-amber-400">
          {streaks.current} {streaks.current === 1 ? 'day' : 'days'}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'
                }`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {item.badge}
                </span>
              )}
              {item.count && !item.badge && (
                <span className="text-[10px] font-mono text-gray-500 group-hover:text-gray-400">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Overall Progress Mini Footer */}
      <div className="p-4 border-t border-white/5 bg-[#090a0f]">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-gray-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Roadmap
          </span>
          <span className="font-mono font-semibold text-white">{stats.daysPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${stats.daysPercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-gray-500 mt-2 font-mono">
          <span>{stats.completedTasks} / {stats.totalTasks} tasks</span>
          <span>{stats.completedDays} / 120 days</span>
        </div>
      </div>
    </aside>
  );
}

import React from 'react';
import { LayoutDashboard, CalendarCheck, Map, Gamepad2, FolderGit2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function MobileNav() {
  const { activeTab, navigateTo } = useApp();

  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'today', label: 'Today', icon: CalendarCheck },
    { id: 'roadmap', label: 'Roadmap', icon: Map },
    { id: 'practice', label: 'Arcade', icon: Gamepad2 },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0d14]/90 backdrop-blur-lg border-t border-white/10 px-2 py-1.5 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => navigateTo(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-indigo-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

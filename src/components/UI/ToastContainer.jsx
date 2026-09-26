import React from 'react';
import { CheckCircle2, Trophy, FolderGit2, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 lg:bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
        let borderClass = 'border-emerald-500/30 bg-[#0f172a]/95 text-emerald-300';

        if (toast.type === 'day') {
          icon = <Trophy className="w-4 h-4 text-amber-400 shrink-0" />;
          borderClass = 'border-amber-500/40 bg-[#1c1917]/95 text-amber-300 shadow-amber-500/10';
        } else if (toast.type === 'milestone') {
          icon = <FolderGit2 className="w-4 h-4 text-purple-400 shrink-0" />;
          borderClass = 'border-purple-500/40 bg-[#1e1b4b]/95 text-purple-300 shadow-purple-500/10';
        } else if (toast.type === 'info') {
          icon = <Info className="w-4 h-4 text-indigo-400 shrink-0" />;
          borderClass = 'border-indigo-500/30 bg-[#11131c]/95 text-indigo-300';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border shadow-xl backdrop-blur-md text-xs font-semibold animate-fade-in ${borderClass}`}
          >
            {icon}
            <span className="tracking-wide">{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="ml-2 text-gray-400 hover:text-white p-0.5 rounded cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

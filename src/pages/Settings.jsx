import React, { useState, useRef } from 'react';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Database,
  ShieldCheck,
  FileJson,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STORAGE_KEYS } from '../utils/storage';

export function Settings() {
  const { exportProgress, importProgress, resetProgress, stats, learningLevel, setLearningLevel } = useApp();

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const res = importProgress(content);
        if (res.success) {
          setImportStatus({ success: true, message: 'Progress successfully restored!' });
        } else {
          setImportStatus({ success: false, message: `Failed to import: ${res.error}` });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmReset = () => {
    resetProgress();
    setConfirmResetOpen(false);
    setImportStatus({ success: true, message: 'All learning progress has been reset.' });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#11131c] border border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Settings & Data Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Backup your roadmap progress, restore from JSON, or reset state with verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-mono text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Storage Engine: LocalStorage Active</span>
        </div>
      </div>

      {/* Notification banner if import or reset was performed */}
      {importStatus && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
            importStatus.success
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {importStatus.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{importStatus.message}</span>
          </div>
          <button
            onClick={() => setImportStatus(null)}
            className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded bg-black/30"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Learning Level Setting */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Learning Level</h2>
            <p className="text-xs text-gray-400">
              Your 120-day roadmap starts directly with JavaScript on Day 1 across all parallel tracks.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => setLearningLevel('html-css-known')}
            className={`flex-1 px-4 py-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-left ${
              learningLevel === 'html-css-known'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
            }`}
          >
            <div className="font-bold mb-0.5">HTML/CSS Already Known</div>
            <div className="text-[11px] opacity-75">Roadmap starts at the active JavaScript sequence without HTML/CSS days</div>
          </button>
          <button
            onClick={() => setLearningLevel('html-css-beginner')}
            className={`flex-1 px-4 py-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-left ${
              learningLevel === 'html-css-beginner'
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
            }`}
          >
            <div className="font-bold mb-0.5">HTML/CSS Beginner</div>
            <div className="text-[11px] opacity-75">Roadmap includes the HTML/CSS foundation path from Day 1</div>
          </button>
        </div>
      </div>

      {/* Backup and Restore Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Export Progress (JSON Backup)</h2>
              <p className="text-xs text-gray-400">
                Download a complete, offline JSON snapshot of all days, tasks, milestones, and practice states.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={exportProgress}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <FileJson className="w-4 h-4" />
              <span>Download career-compass-backup.json</span>
            </button>
          </div>
        </div>

        {/* Import Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Restore from Backup</h2>
              <p className="text-xs text-gray-400">
                Restore learning progress from a previously exported Career Compass JSON file.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Select Backup JSON File</span>
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone: Reset Progress */}
      <div className="glass-panel p-6 rounded-3xl border border-rose-500/20 bg-rose-950/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Danger Zone: Reset Progress</h2>
            <p className="text-xs text-gray-400">
              Clear all completed days, tasks, project milestones, and practice marks. This action requires confirmation.
            </p>
          </div>
        </div>

        <button
          onClick={() => setConfirmResetOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset All Learning Progress...</span>
        </button>
      </div>

      {/* Persistent Storage Keys Telemetry */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-3">
        <div className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          Verified LocalStorage Key Registry (v1 Schema)
        </div>
        <p className="text-xs text-gray-400">
          All keys are strictly prefixed and stable across application releases. Never randomly generated.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2 font-mono text-xs">
          {Object.entries(STORAGE_KEYS).map(([name, key]) => (
            <div key={key} className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="truncate min-w-0">
                <span className="text-gray-400">{name}:</span>{' '}
                <span className="text-gray-200">{key}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#161722] border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">Reset All Progress?</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              This will reset all your completed tasks ({stats.completedTasks}), days ({stats.completedDays}), project milestones, and streaks back to zero. You can export a backup first if you want to save it.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setConfirmResetOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

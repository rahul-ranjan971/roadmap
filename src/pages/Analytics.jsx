import React from 'react';
import {
  BarChart3,
  Calendar,
  Flame,
  Layers,
  Cpu,
  Binary,
  FileCode,
  Brain,
  Briefcase,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Analytics() {
  const { stats, streaks, phases } = useApp();

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#11131c] border border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Learning Analytics & Velocity
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Comprehensive telemetry of your 120-day journey based entirely on verified state
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full text-xs font-mono text-amber-400">
          <Flame className="w-3.5 h-3.5" />
          <span>Active Streak: {streaks.current} days</span>
        </div>
      </div>

      {/* Top Level Key Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-panel p-4 rounded-2xl border border-white/5">
          <div className="text-[10px] text-gray-400 uppercase font-semibold">Days Completed</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {stats.completedDays} <span className="text-xs text-gray-500 font-normal">/ 120</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1">{stats.daysPercent}% achieved</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5">
          <div className="text-[10px] text-gray-400 uppercase font-semibold">Tasks Completed</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {stats.completedTasks} <span className="text-xs text-gray-500 font-normal">/ {stats.totalTasks}</span>
          </div>
          <div className="text-[10px] text-indigo-400 font-mono mt-1">{stats.tasksPercent}% verified</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5">
          <div className="text-[10px] text-gray-400 uppercase font-semibold">Remaining Tasks</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {stats.totalTasks - stats.completedTasks}
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-1">Across 120 days</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5">
          <div className="text-[10px] text-gray-400 uppercase font-semibold">Project Milestones</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {stats.completedMilestones} <span className="text-xs text-gray-500 font-normal">/ {stats.totalMilestones}</span>
          </div>
          <div className="text-[10px] text-purple-400 font-mono mt-1">{stats.milestonesPercent}% delivered</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5">
          <div className="text-[10px] text-gray-400 uppercase font-semibold">Arcade Practice</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {stats.completedPractice} <span className="text-xs text-gray-500 font-normal">/ {stats.totalPractice}</span>
          </div>
          <div className="text-[10px] text-cyan-400 font-mono mt-1">{stats.practicePercent}% practiced</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5">
          <div className="text-[10px] text-gray-400 uppercase font-semibold">Longest Streak</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {streaks.longest} <span className="text-xs text-gray-500 font-normal">days</span>
          </div>
          <div className="text-[10px] text-amber-300/80 font-mono mt-1">Sunday = safe rest</div>
        </div>
      </div>

      {/* 11 Phases Progress Meters */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            Phase-by-Phase Execution Progress
          </h2>
          <span className="text-xs text-gray-400 font-mono">11 Curriculum Phases</span>
        </div>

        <div className="space-y-3">
          {phases.map((ph, idx) => {
            const pStat = stats.phaseStats[ph.id] || { percent: 0, completedDays: 0, totalDays: 0, completedTasks: 0, totalTasks: 0 };
            return (
              <div key={ph.id} className="p-4 rounded-2xl bg-black/40 border border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-gray-400">
                      Phase {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <span className="text-xs font-bold text-white">{ph.name}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-gray-400">
                      {pStat.completedDays} / {pStat.totalDays} days
                    </span>
                    <span className="font-bold" style={{ color: ph.color }}>
                      {pStat.percent}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pStat.percent}%`,
                      backgroundColor: ph.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Track Distribution Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Main Stack */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              Main Stack
            </span>
            <span className="text-xs font-bold font-mono text-white">
              {stats.trackStats.main.total > 0
                ? Math.round((stats.trackStats.main.completed / stats.trackStats.main.total) * 100)
                : 0}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{
                width: `${stats.trackStats.main.total > 0
                  ? Math.round((stats.trackStats.main.completed / stats.trackStats.main.total) * 100)
                  : 0}%`,
              }}
            />
          </div>
          <div className="text-[11px] text-gray-400 font-mono">
            {stats.trackStats.main.completed} / {stats.trackStats.main.total} tasks completed
          </div>
        </div>

        {/* Core Software */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              Core CS
            </span>
            <span className="text-xs font-bold font-mono text-white">
              {stats.trackStats['core-cs'].total > 0
                ? Math.round((stats.trackStats['core-cs'].completed / stats.trackStats['core-cs'].total) * 100)
                : 0}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded-full"
              style={{
                width: `${stats.trackStats['core-cs'].total > 0
                  ? Math.round((stats.trackStats['core-cs'].completed / stats.trackStats['core-cs'].total) * 100)
                  : 0}%`,
              }}
            />
          </div>
          <div className="text-[11px] text-gray-400 font-mono">
            {stats.trackStats['core-cs'].completed} / {stats.trackStats['core-cs'].total} tasks completed
          </div>
        </div>

        {/* DSA */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Binary className="w-4 h-4" />
              C++ & DSA
            </span>
            <span className="text-xs font-bold font-mono text-white">
              {stats.trackStats['cpp-dsa'].total > 0
                ? Math.round((stats.trackStats['cpp-dsa'].completed / stats.trackStats['cpp-dsa'].total) * 100)
                : 0}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full"
              style={{
                width: `${stats.trackStats['cpp-dsa'].total > 0
                  ? Math.round((stats.trackStats['cpp-dsa'].completed / stats.trackStats['cpp-dsa'].total) * 100)
                  : 0}%`,
              }}
            />
          </div>
          <div className="text-[11px] text-gray-400 font-mono">
            {stats.trackStats['cpp-dsa'].completed} / {stats.trackStats['cpp-dsa'].total} tasks completed
          </div>
        </div>

        {/* Aptitude (KODEX) */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-4 h-4" />
              Aptitude (KODEX)
            </span>
            <span className="text-xs font-bold font-mono text-white">
              {stats.trackStats.aptitude?.total > 0
                ? Math.round((stats.trackStats.aptitude.completed / stats.trackStats.aptitude.total) * 100)
                : 0}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-400 rounded-full"
              style={{
                width: `${stats.trackStats.aptitude?.total > 0
                  ? Math.round((stats.trackStats.aptitude.completed / stats.trackStats.aptitude.total) * 100)
                  : 0}%`,
              }}
            />
          </div>
          <div className="text-[11px] text-gray-400 font-mono">
            {stats.trackStats.aptitude?.completed || 0} / {stats.trackStats.aptitude?.total || 0} tasks completed
          </div>
        </div>

        {/* Python Track */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileCode className="w-4 h-4" />
              Python Track
            </span>
            <span className="text-xs font-bold font-mono text-white">
              {stats.trackStats.python.total > 0
                ? Math.round((stats.trackStats.python.completed / stats.trackStats.python.total) * 100)
                : 0}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full"
              style={{
                width: `${stats.trackStats.python.total > 0
                  ? Math.round((stats.trackStats.python.completed / stats.trackStats.python.total) * 100)
                  : 0}%`,
              }}
            />
          </div>
          <div className="text-[11px] text-gray-400 font-mono">
            {stats.trackStats.python.completed} / {stats.trackStats.python.total} tasks completed
          </div>
        </div>

        {/* Career Prep */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" />
              Career Prep
            </span>
            <span className="text-xs font-bold font-mono text-white">
              {stats.trackStats.career?.total > 0
                ? Math.round((stats.trackStats.career.completed / stats.trackStats.career.total) * 100)
                : 0}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-400 rounded-full"
              style={{
                width: `${stats.trackStats.career?.total > 0
                  ? Math.round((stats.trackStats.career.completed / stats.trackStats.career.total) * 100)
                  : 0}%`,
              }}
            />
          </div>
          <div className="text-[11px] text-gray-400 font-mono">
            {stats.trackStats.career?.completed || 0} / {stats.trackStats.career?.total || 0} tasks completed
          </div>
        </div>
      </div>
    </div>
  );
}

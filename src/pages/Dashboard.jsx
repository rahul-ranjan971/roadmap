import React from 'react';
import {
  Compass,
  Flame,
  CheckCircle2,
  Circle,
  Calendar,
  FolderGit2,
  Gamepad2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Binary,
  Cpu,
  FileCode,
  BookOpen,
  Repeat,
  ExternalLink,
  Brain,
  Briefcase,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Dashboard() {
  const {
    stats,
    streaks,
    phases,
    navigateTo,
    todayQuote,
    days,
    tasks,
    toggleTask,
    todayMission,
    htmlCssKnown,
  } = useApp();

  const currentDay = stats.currentDay;
  const currentPhase = stats.currentPhase;
  const activeDayNumber = currentDay ? currentDay.day : 1;

  const isAiUnlocked = !!stats.aiTrackStatus?.isUnlocked;
  const isAiPythonTask = (t) =>
    t.topicId.includes('python') ||
    t.topicId.includes('genai') ||
    t.topicId.includes('ai-engineering');

  const todayActiveTasks = currentDay
    ? currentDay.tasks.filter((t) => isAiUnlocked || !isAiPythonTask(t))
    : [];
  const todayCompletedTasks = todayActiveTasks.filter((t) => tasks[t.id]);

  // Icon map for active tracks
  const trackIcons = {
    main: <BookOpen className="w-4 h-4 text-indigo-400" />,
    'core-cs': <Cpu className="w-4 h-4 text-cyan-400" />,
    dsa: <Binary className="w-4 h-4 text-emerald-400" />,
    python: <FileCode className="w-4 h-4 text-amber-400" />,
    aptitude: <Brain className="w-4 h-4 text-violet-400" />,
    career: <Briefcase className="w-4 h-4 text-rose-400" />,
    genai: <Sparkles className="w-4 h-4 text-rose-400" />,
    project: <FolderGit2 className="w-4 h-4 text-purple-400" />,
    revision: <Repeat className="w-4 h-4 text-violet-400" />,
    practice: <Gamepad2 className="w-4 h-4 text-pink-400" />,
  };

  // Navigation targets per track
  const trackNavTargets = {
    main: 'today',
    'core-cs': 'core-cs',
    dsa: 'dsa',
    python: 'python',
    aptitude: 'today',
    career: 'careers',
    genai: 'ai',
    project: 'projects',
    revision: 'revision',
    practice: 'practice',
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-[#11131c] border border-white/10 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Compass className="w-3.5 h-3.5" />
              Welcome Back • Personal Career OS
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Day {activeDayNumber} of 120
            </h1>
            <p className="text-gray-300 text-sm mt-1 max-w-xl">
              Currently in <span className="text-indigo-400 font-semibold">{currentPhase.name}</span> (Week {currentDay.week}).
              {days[currentDay.id] ? ' Today is completed! Great job!' : ' Complete your daily mission below.'}
            </p>
          </div>

          {/* Quick CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('today', currentDay.id)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <span>Today&apos;s Mission</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigateTo('practice')}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium border border-white/5 transition-colors cursor-pointer"
            >
              Practice Arcade
            </button>
          </div>
        </div>
      </div>

      {/* HTML/CSS Already Known Banner */}
      {htmlCssKnown && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">HTML & CSS: Already Known</span>
            <p className="text-[11px] text-gray-400 mt-0.5">Your roadmap starts with JavaScript. HTML/CSS remain available for revision in the Roadmap.</p>
          </div>
        </div>
      )}

      {/* Prominent Daily Mission on Dashboard (Requirement 18) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-[#121528] to-[#0c0d16] shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight uppercase">
                  TODAY&apos;S MISSION — DAY {activeDayNumber} / 120
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {todayCompletedTasks.length} / {todayActiveTasks.length} Completed
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {currentDay.title} • Showing only active tracks for today
              </p>
            </div>
          </div>

          <button
            onClick={() => navigateTo('today', currentDay.id)}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 border border-white/5 transition-colors cursor-pointer w-fit"
          >
            <span>Open Interactive Day</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Active tracks list (only tracks active today) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {todayMission?.sections?.map((sec) => {
            const navTarget = trackNavTargets[sec.id] || 'today';
            const icon = trackIcons[sec.id] || <BookOpen className="w-4 h-4 text-indigo-400" />;

            return (
              <div
                key={sec.id}
                className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between hover:border-white/10 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <button
                      onClick={() => navigateTo(navTarget, currentDay.id)}
                      className="flex items-center gap-2 text-xs font-bold text-white hover:text-indigo-300 transition-colors cursor-pointer text-left"
                    >
                      {icon}
                      <span>{sec.label}</span>
                    </button>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${sec.color}`}>
                      {sec.badge}
                    </span>
                  </div>

                  <div className="text-xs text-gray-300 font-medium mb-3">
                    {sec.focus}
                  </div>

                  {/* Quick-action checkboxes right on the mission card */}
                  {sec.tasks && sec.tasks.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      {sec.tasks.map((task) => {
                        const isDone = !!tasks[task.id];
                        return (
                          <button
                            key={task.id}
                            onClick={() => toggleTask(task.id, currentDay.id)}
                            className={`w-full p-2 rounded-xl text-left text-xs flex items-start gap-2 transition-all cursor-pointer ${
                              isDone
                                ? 'bg-emerald-950/20 text-gray-400'
                                : 'bg-white/5 hover:bg-white/10 text-gray-200'
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                            )}
                            <span className={`truncate text-[11px] ${isDone ? 'line-through text-gray-500' : ''}`}>
                              {task.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Resource launch button if practice track */}
                  {sec.resource && (
                    <div className="pt-2 border-t border-white/5">
                      <a
                        href={sec.resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/20 text-xs font-semibold transition-colors"
                      >
                        <span>Launch {sec.resource.name}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-mono">
                    {sec.tasks?.length ? `${sec.tasks.length} task${sec.tasks.length > 1 ? 's' : ''}` : 'Special focus'}
                  </span>
                  <button
                    onClick={() => navigateTo(navTarget, currentDay.id)}
                    className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Track</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Completion */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Overall Progress</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{stats.daysPercent}%</span>
            <span className="text-xs text-gray-400 font-mono">({stats.completedDays} / 120 days)</span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${stats.daysPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-gray-500 mt-2 font-mono">
            {stats.completedTasks} / {stats.totalTasks} total tasks completed
          </div>
        </div>

        {/* Study Streak */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Study Streak</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-400">{streaks.current}</span>
            <span className="text-xs text-gray-400 font-mono">consecutive days</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-3 font-mono">
            Longest recorded streak: <span className="text-white font-semibold">{streaks.longest} days</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-1">
            Sunday is non-penalized rest day
          </div>
        </div>

        {/* Project Lab */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Project Milestones</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-indigo-400">{stats.milestonesPercent}%</span>
            <span className="text-xs text-gray-400 font-mono">({stats.completedMilestones} / {stats.totalMilestones})</span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.milestonesPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-gray-500 mt-2 font-mono">
            Across 13 flagship portfolio projects
          </div>
        </div>

        {/* Practice Arcade */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Practice Arcade</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Gamepad2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-purple-400">{stats.practicePercent}%</span>
            <span className="text-xs text-gray-400 font-mono">({stats.completedPractice} / {stats.totalPractice})</span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.practicePercent}%` }}
            />
          </div>
          <div className="text-[11px] text-gray-500 mt-2 font-mono">
            28 verified interactive resources
          </div>
        </div>
      </div>

      {/* Parallel Tracks Progress Breakdown */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Parallel Tracks Completion
          </h2>
          <span className="text-xs text-gray-400">Real-time status based on roadmap tasks</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Main Track */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                Main Stack
              </span>
              <span className="font-mono text-indigo-300 font-semibold">
                {stats.trackStats.main.total > 0
                  ? Math.round((stats.trackStats.main.completed / stats.trackStats.main.total) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{
                  width: `${stats.trackStats.main.total > 0
                    ? Math.round((stats.trackStats.main.completed / stats.trackStats.main.total) * 100)
                    : 0}%`,
                }}
              />
            </div>
            <div className="text-[10px] text-gray-500 mt-2 font-mono">
              {stats.trackStats.main.completed} / {stats.trackStats.main.total} tasks
            </div>
          </div>

          {/* Core Software */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                Core CS & Sys Design
              </span>
              <span className="font-mono text-cyan-300 font-semibold">
                {stats.trackStats['core-cs'].total > 0
                  ? Math.round((stats.trackStats['core-cs'].completed / stats.trackStats['core-cs'].total) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full"
                style={{
                  width: `${stats.trackStats['core-cs'].total > 0
                    ? Math.round((stats.trackStats['core-cs'].completed / stats.trackStats['core-cs'].total) * 100)
                    : 0}%`,
                }}
              />
            </div>
            <div className="text-[10px] text-gray-500 mt-2 font-mono">
              {stats.trackStats['core-cs'].completed} / {stats.trackStats['core-cs'].total} tasks
            </div>
          </div>

          {/* C++ & DSA */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                <Binary className="w-3.5 h-3.5 text-emerald-400" />
                C++ & DSA
              </span>
              <span className="font-mono text-emerald-300 font-semibold">
                {stats.trackStats['cpp-dsa'].total > 0
                  ? Math.round((stats.trackStats['cpp-dsa'].completed / stats.trackStats['cpp-dsa'].total) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{
                  width: `${stats.trackStats['cpp-dsa'].total > 0
                    ? Math.round((stats.trackStats['cpp-dsa'].completed / stats.trackStats['cpp-dsa'].total) * 100)
                    : 0}%`,
                }}
              />
            </div>
            <div className="text-[10px] text-gray-500 mt-2 font-mono">
              {stats.trackStats['cpp-dsa'].completed} / {stats.trackStats['cpp-dsa'].total} tasks
            </div>
          </div>

          {/* Python & AI */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                Python & AI Track
              </span>
              <span className="font-mono text-amber-300 font-semibold">
                {stats.trackStats.python.total > 0
                  ? Math.round((stats.trackStats.python.completed / stats.trackStats.python.total) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{
                  width: `${stats.trackStats.python.total > 0
                    ? Math.round((stats.trackStats.python.completed / stats.trackStats.python.total) * 100)
                    : 0}%`,
                }}
              />
            </div>
            <div className="text-[10px] text-gray-500 mt-2 font-mono">
              {stats.trackStats.python.completed} / {stats.trackStats.python.total} tasks
            </div>
          </div>
        </div>
      </div>

      {/* 11 Phases Journey Visualizer */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              11-Phase Curriculum Progression
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Click any phase to inspect topics and roadmap days</p>
          </div>
          <button
            onClick={() => navigateTo('roadmap')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Full Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {phases.map((ph, idx) => {
            const phaseStat = stats.phaseStats[ph.id] || { percent: 0, completedDays: 0, totalDays: 0 };
            const isCurrent = currentPhase.id === ph.id;
            return (
              <button
                key={ph.id}
                onClick={() => navigateTo('roadmap')}
                className={`p-4 rounded-2xl border text-left transition-all group cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-950/30 border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                    : 'bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-gray-400">
                    Phase {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </span>
                  <span className="text-[11px] font-mono font-bold" style={{ color: ph.color }}>
                    {phaseStat.percent}%
                  </span>
                </div>
                <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                  {ph.name}
                </div>
                <div className="text-[11px] text-gray-400 mt-1 font-mono">
                  Days {ph.startDay}–{ph.endDay} ({phaseStat.completedDays}/{phaseStat.totalDays} done)
                </div>
                <div className="w-full h-1 bg-gray-800 rounded-full mt-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${phaseStat.percent}%`,
                      backgroundColor: ph.color,
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quote Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/30 via-indigo-950/20 to-black/30 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <blockquote className="text-xs sm:text-sm text-gray-200 italic">
              &ldquo;{todayQuote.quote || todayQuote.text}&rdquo;
            </blockquote>
            <p className="text-[11px] font-semibold text-purple-400 mt-1">
              — {todayQuote.author}
              {todayQuote.category && <span className="text-gray-500 font-normal ml-2">({todayQuote.category})</span>}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigateTo('revision')}
          className="text-xs font-medium px-3.5 py-1.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 transition-colors whitespace-nowrap cursor-pointer shrink-0"
        >
          Revision Center
        </button>
      </div>
    </div>
  );
}

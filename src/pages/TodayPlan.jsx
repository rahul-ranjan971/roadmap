import React, { useMemo, useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  BookOpen,
  Cpu,
  Binary,
  Brain,
  Briefcase,
  FileCode,
  Repeat,
  FolderGit2,
  ChevronLeft,
  ChevronRight,
  FileEdit,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function TodayPlan() {
  const {
    roadmap,
    phases,
    topics,
    selectedDayId,
    setSelectedDayId,
    tasks,
    days,
    toggleTask,
    toggleDay,
    notes,
    setDayNote,
    aiTrackStatus,
    isAiPythonTask,
    filterObjectivesForAiGate,
  } = useApp();

  const currentDay = roadmap.find((d) => d.id === selectedDayId) || roadmap[0];
  const currentPhase = phases.find((p) => p.id === currentDay.phase) || phases[0];
  const activeDayNumber = currentDay.day;
  const isDayCompleted = !!days[currentDay.id];
  const isAiUnlocked = !!aiTrackStatus?.isUnlocked;

  const [noteText, setNoteText] = useState(() => notes[currentDay.id] || '');

  // Core CS strictly follows: 1. SQL -> 2. OOP -> 3. DBMS -> 4. OS -> 5. CN -> 6. System Design
  const CORE_CS_TOPIC_ORDER = [
    'topic-sql',
    'topic-oop',
    'topic-dbms',
    'topic-os',
    'topic-cn',
    'topic-system-design',
  ];

  const isCoreCsTask = (t) => {
    return CORE_CS_TOPIC_ORDER.some((id) => t.topicId === id || t.topicId.startsWith(`${id}-`));
  };

  const isAptitudeTask = (t) => {
    const top = topics?.find((tp) => tp.id === t.topicId);
    return top?.track === 'aptitude' || t.topicId === 'topic-aptitude' || t.topicId.startsWith('topic-aptitude-');
  };

  const isDsaTask = (t) => {
    const top = topics?.find((tp) => tp.id === t.topicId);
    return top?.track === 'cpp-dsa' || t.topicId.includes('cpp') || t.topicId.includes('dsa');
  };

  const isCareerTask = (t) => {
    const top = topics?.find((tp) => tp.id === t.topicId);
    if (top?.track === 'career') return true;
    return (
      t.topicId.includes('resume') ||
      t.topicId.includes('communication') ||
      t.topicId.includes('interview')
    );
  };

  // Main Stack (Sheryians KODEX)
  const mainTasks = currentDay.tasks.filter(
    (t) =>
      !isCoreCsTask(t) &&
      !isAptitudeTask(t) &&
      !isDsaTask(t) &&
      !isAiPythonTask(t) &&
      !isCareerTask(t)
  );

  // DSA with C++ (Page Source)
  const dsaTasks = currentDay.tasks.filter(isDsaTask);

  // Aptitude (Sheryians KODEX) - strictly separate from Core CS
  const aptitudeTasks = currentDay.tasks.filter(isAptitudeTask);

  // Core CS (Page Source) - ordered strictly: SQL -> OOP -> DBMS -> OS -> CN -> System Design
  const coreTasks = currentDay.tasks
    .filter(isCoreCsTask)
    .sort((a, b) => {
      const aIdx = CORE_CS_TOPIC_ORDER.findIndex((id) => a.topicId.startsWith(id));
      const bIdx = CORE_CS_TOPIC_ORDER.findIndex((id) => b.topicId.startsWith(id));
      return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
    });

  // Python & AI Track Tasks
  const aiPythonTasks = currentDay.tasks.filter(isAiPythonTask);

  // Career Preparation (Resume, Communication, Interviews)
  const careerTasks = currentDay.tasks.filter(isCareerTask);

  // Remaining tasks fallback if any did not match above (include aiPythonTasks so they never leak into otherTasks)
  const handledIds = new Set([
    ...mainTasks.map((t) => t.id),
    ...dsaTasks.map((t) => t.id),
    ...aptitudeTasks.map((t) => t.id),
    ...coreTasks.map((t) => t.id),
    ...aiPythonTasks.map((t) => t.id),
    ...careerTasks.map((t) => t.id),
  ]);
  const otherTasks = currentDay.tasks.filter((t) => !handledIds.has(t.id) && !isAiPythonTask(t));

  // Day navigation
  const dayIndex = roadmap.findIndex((d) => d.id === currentDay.id);
  const prevDay = dayIndex > 0 ? roadmap[dayIndex - 1] : null;
  const nextDay = dayIndex < roadmap.length - 1 ? roadmap[dayIndex + 1] : null;

  // Active day tasks and completion (locked AI/Python tasks excluded from today's counts)
  const activeDayTasks = currentDay.tasks.filter((t) => isAiUnlocked || !isAiPythonTask(t));
  const completedCount = activeDayTasks.filter((t) => tasks[t.id]).length;
  const totalCount = activeDayTasks.length;
  const dayPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const displayObjectives = useMemo(() => {
    return filterObjectivesForAiGate ? filterObjectivesForAiGate(currentDay.objectives, isAiUnlocked) : currentDay.objectives;
  }, [currentDay.objectives, isAiUnlocked, filterObjectivesForAiGate]);

  const handleNoteBlur = () => {
    setDayNote(currentDay.id, noteText);
  };

  const handleDaySwitch = (targetDayId) => {
    setSelectedDayId(targetDayId);
    setNoteText(notes[targetDayId] || '');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner: Day Navigation & State */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#11131c] border border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Day {activeDayNumber} of 120
              </span>
              <span className="text-xs font-mono text-gray-400">Week {currentDay.week}</span>
              <span className="text-xs font-medium text-purple-400">• {currentPhase.name}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              {currentDay.title}
            </h1>
          </div>
        </div>

        {/* Prev / Next buttons & Complete Day toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => prevDay && handleDaySwitch(prevDay.id)}
            disabled={!prevDay}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors border border-white/5"
            title="Previous Day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => toggleDay(currentDay.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              isDayCompleted
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isDayCompleted ? 'text-emerald-400' : 'text-gray-400'}`} />
            <span>{isDayCompleted ? 'Day Completed ✓' : 'Complete Day'}</span>
          </button>

          <button
            onClick={() => nextDay && handleDaySwitch(nextDay.id)}
            disabled={!nextDay}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors border border-white/5"
            title="Next Day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress & Quick Stats bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Task Completion Bar */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="flex justify-between text-xs font-medium text-gray-400 mb-2">
            <span>Today&apos;s Tasks Progress</span>
            <span className="font-mono text-indigo-300 font-bold">
              {completedCount} / {totalCount} ({dayPercent}%)
            </span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${dayPercent}%` }}
            />
          </div>
        </div>

        {/* Estimated Time */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Estimated Study Time</div>
            <div className="text-sm font-bold text-white font-mono">5.5 Hours (11:30 AM – 6:00 PM)</div>
          </div>
        </div>

        {/* Day Status */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isDayCompleted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Day Status</div>
            <div className="text-sm font-bold text-white">
              {isDayCompleted ? 'Completed & Logged' : 'In Progress'}
            </div>
          </div>
        </div>
      </div>

      {/* Objectives Box */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5">
        <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Today&apos;s Core Objectives
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {displayObjectives.map((obj, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-200 flex items-start gap-2">
              <span className="text-indigo-400 font-bold">0{i + 1}.</span>
              <span>{obj}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Structured Tasks by Track */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Today&apos;s Study Tasks by Track
          </h2>
          <span className="text-xs text-gray-400">Checked state persists automatically</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Main Track Tasks (Sheryians KODEX) */}
          {mainTasks.length > 0 && (
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  Main Track (11:30–1:00 & 2:30–4:00)
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  {mainTasks.filter((t) => tasks[t.id]).length}/{mainTasks.length} done
                </span>
              </div>
              <div className="space-y-2">
                {mainTasks.map((t) => {
                  const done = !!tasks[t.id];
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTask(t.id, currentDay.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                        done
                          ? 'bg-emerald-950/20 border-emerald-500/20 text-gray-400'
                          : 'bg-white/5 border-white/5 hover:border-white/10 text-gray-200'
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium ${done ? 'line-through text-gray-500' : ''}`}>
                          {t.title}
                        </div>
                        <div className="text-[10px] text-indigo-400 font-mono mt-0.5 uppercase">
                          {t.type} • {t.topicId}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. C++ & DSA Tasks (Page Source) */}
          {dsaTasks.length > 0 && (
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Binary className="w-4 h-4" />
                  C++ & DSA Practice (5:15–5:45)
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  {dsaTasks.filter((t) => tasks[t.id]).length}/{dsaTasks.length} done
                </span>
              </div>
              <div className="space-y-2">
                {dsaTasks.map((t) => {
                  const done = !!tasks[t.id];
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTask(t.id, currentDay.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                        done
                          ? 'bg-emerald-950/20 border-emerald-500/20 text-gray-400'
                          : 'bg-white/5 border-white/5 hover:border-white/10 text-gray-200'
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium ${done ? 'line-through text-gray-500' : ''}`}>
                          {t.title}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono mt-0.5 uppercase">
                          {t.type} • {t.topicId}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Aptitude Track Tasks (Sheryians KODEX) */}
          {aptitudeTasks.length > 0 && (
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <span className="text-xs font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-violet-400" />
                  Aptitude • KODEX
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  {aptitudeTasks.filter((t) => tasks[t.id]).length}/{aptitudeTasks.length} done
                </span>
              </div>
              <div className="space-y-2">
                {aptitudeTasks.map((t) => {
                  const done = !!tasks[t.id];
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTask(t.id, currentDay.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                        done
                          ? 'bg-emerald-950/20 border-emerald-500/20 text-gray-400'
                          : 'bg-white/5 border-white/5 hover:border-white/10 text-gray-200'
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium ${done ? 'line-through text-gray-500' : ''}`}>
                          {t.title}
                        </div>
                        <div className="text-[10px] text-violet-400 font-mono mt-0.5 uppercase">
                          {t.type} • KODEX Aptitude
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Core Software Engineering Tasks (Page Source) */}
          {(coreTasks.length > 0 || currentDay.day === 1 || (currentDay.schedule?.coreCS && currentDay.schedule.coreCS.topic !== 'topic-aptitude')) && (
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  Core CS • Page Source (4:30–5:15)
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  {coreTasks.filter((t) => tasks[t.id]).length}/{coreTasks.length} done
                </span>
              </div>
              <div className="space-y-2">
                {coreTasks.map((t) => {
                  const done = !!tasks[t.id];
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTask(t.id, currentDay.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                        done
                          ? 'bg-emerald-950/20 border-emerald-500/20 text-gray-400'
                          : 'bg-white/5 border-white/5 hover:border-white/10 text-gray-200'
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium ${done ? 'line-through text-gray-500' : ''}`}>
                          {t.title}
                        </div>
                        <div className="text-[10px] text-cyan-400 font-mono mt-0.5 uppercase">
                          {t.type} • {t.topicId}
                        </div>
                      </div>
                    </button>
                  );
                })}
                {coreTasks.length === 0 && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400">
                    {currentDay.schedule?.coreCS?.topic === 'topic-aptitude'
                      ? 'Core CS track scheduled in sequence (1. SQL → 2. OOP → 3. DBMS → 4. OS → 5. CN → 6. System Design).'
                      : (currentDay.schedule?.coreCS?.focus || 'Core CS & System Design')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. Python & AI Track Tasks — only when unlocked by progression gate */}
          {isAiUnlocked && aiPythonTasks.length > 0 && (
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCode className="w-4 h-4" />
                  Python & AI Track
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  {aiPythonTasks.filter((t) => tasks[t.id]).length}/{aiPythonTasks.length} done
                </span>
              </div>
              <div className="space-y-2">
                {aiPythonTasks.map((t) => {
                  const done = !!tasks[t.id];
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTask(t.id, currentDay.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                        done
                          ? 'bg-emerald-950/20 border-emerald-500/20 text-gray-400'
                          : 'bg-white/5 border-white/5 hover:border-white/10 text-gray-200'
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium ${done ? 'line-through text-gray-500' : ''}`}>
                          {t.title}
                        </div>
                        <div className="text-[10px] text-amber-400 font-mono mt-0.5 uppercase">
                          {t.type} • {t.topicId}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. Career Preparation Tasks */}
          {careerTasks.length > 0 && (
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <span className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-rose-400" />
                  Career Prep & Placement
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  {careerTasks.filter((t) => tasks[t.id]).length}/{careerTasks.length} done
                </span>
              </div>
              <div className="space-y-2">
                {careerTasks.map((t) => {
                  const done = !!tasks[t.id];
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTask(t.id, currentDay.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                        done
                          ? 'bg-emerald-950/20 border-emerald-500/20 text-gray-400'
                          : 'bg-white/5 border-white/5 hover:border-white/10 text-gray-200'
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium ${done ? 'line-through text-gray-500' : ''}`}>
                          {t.title}
                        </div>
                        <div className="text-[10px] text-rose-400 font-mono mt-0.5 uppercase">
                          {t.type} • {t.topicId}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 7. Other / Uncategorized Tasks */}
          {otherTasks.length > 0 && (
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Additional Tasks
                </span>
              </div>
              <div className="space-y-2">
                {otherTasks.map((t) => {
                  const done = !!tasks[t.id];
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTask(t.id, currentDay.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                        done
                          ? 'bg-emerald-950/20 border-emerald-500/20 text-gray-400'
                          : 'bg-white/5 border-white/5 hover:border-white/10 text-gray-200'
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium ${done ? 'line-through text-gray-500' : ''}`}>
                          {t.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spaced Revision & Project Milestone Details */}
      {(currentDay.revision || currentDay.project) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentDay.revision && (
            <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 bg-purple-950/10">
              <div className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Repeat className="w-4 h-4" />
                Spaced Revision Item
              </div>
              <div className="text-sm font-medium text-gray-200">{currentDay.revision.focus}</div>
            </div>
          )}
          {currentDay.project && (
            <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 bg-indigo-950/10">
              <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4" />
                Project Milestone Assignment
              </div>
              <div className="text-sm font-medium text-gray-200">{currentDay.project.milestone}</div>
            </div>
          )}
        </div>
      )}

      {/* Daily Notes (Persisted) */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-gray-300 flex items-center gap-2">
            <FileEdit className="w-4 h-4 text-amber-400" />
            Day {currentDay.day} Personal Notes & Code Insights
          </div>
          <span className="text-[11px] text-gray-500 font-mono">Auto-saved to localStorage</span>
        </div>
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onBlur={handleNoteBlur}
          placeholder="Jot down formulas, debugging steps, algorithms practiced, or concepts you want to review later..."
          rows={3}
          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-sans"
        />
      </div>
    </div>
  );
}

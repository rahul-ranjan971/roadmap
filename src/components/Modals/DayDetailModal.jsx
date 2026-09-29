import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Sparkles,
  Repeat,
  FolderGit2,
  FileEdit,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function DayDetailModal({ dayId, onClose }) {
  const {
    roadmap,
    phases,
    tasks,
    days,
    toggleTask,
    toggleDay,
    notes,
    setDayNote,
    stats,
    isAiPythonTask,
    filterObjectivesForAiGate,
  } = useApp();
  const [noteInput, setNoteInput] = useState(() => notes[dayId] || '');

  const day = roadmap.find((d) => d.id === dayId);
  if (!day) return null;

  const isAiUnlocked = stats?.aiTrackStatus?.isUnlocked;
  const phase = phases.find((p) => p.id === day.phase) || phases[0];
  const isCompleted = !!days[day.id];
  const visibleTasks = isAiUnlocked ? day.tasks : day.tasks.filter((t) => !isAiPythonTask(t));
  const tasksCompletedCount = visibleTasks.filter((t) => tasks[t.id]).length;
  const percentDone = visibleTasks.length > 0 ? Math.round((tasksCompletedCount / visibleTasks.length) * 100) : 0;
  const displayObjectives = filterObjectivesForAiGate
    ? filterObjectivesForAiGate(day.objectives, isAiUnlocked)
    : day.objectives;

  const handleNoteBlur = () => {
    setDayNote(dayId, noteInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#11131c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-transparent flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Day {day.day} of 120
              </span>
              <span className="text-xs font-mono text-gray-400">Week {day.week}</span>
              <span className="text-xs font-medium text-purple-400">• {phase.name}</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{day.title}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleDay(day.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? 'Day Completed' : 'Mark Day Done'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-gray-400">
              <span>Task Progress</span>
              <span className="font-mono text-indigo-300">
                {tasksCompletedCount} / {visibleTasks.length} tasks ({percentDone}%)
              </span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${percentDone}%` }}
              />
            </div>
          </div>

          {/* Objectives */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Day Objectives
            </div>
            <ul className="space-y-1.5">
              {displayObjectives.map((obj, i) => (
                <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Study Schedule Routine */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Daily Study Schedule (11:30 AM – 6:00 PM)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                <span className="font-mono text-indigo-400 font-semibold block">11:30 AM – 1:00 PM</span>
                <span className="text-gray-300">{day.schedule?.mainTrack?.focus || 'Main Track Focus'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                <span className="font-mono text-amber-400 font-semibold block">1:00 PM – 2:30 PM</span>
                <span className="text-gray-400">Lunch & Mind Rest Break</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                <span className="font-mono text-indigo-400 font-semibold block">2:30 PM – 4:00 PM</span>
                <span className="text-gray-300">Main Track Deep Practice</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                <span className="font-mono text-amber-400 font-semibold block">4:00 PM – 4:30 PM</span>
                <span className="text-gray-400">
                  {day.schedule?.aptitude ? (day.schedule.aptitude.focus || 'Aptitude Practice (KODEX)') : 'Rest & Recharge Break'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                <span className="font-mono text-cyan-400 font-semibold block">4:30 PM – 5:15 PM</span>
                <span className="text-gray-300">
                  {day.schedule?.coreCS?.topic === 'topic-aptitude'
                    ? 'Aptitude Practice (KODEX)'
                    : (day.schedule?.coreCS?.focus || 'Core Software Engineering')}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                <span className="font-mono text-emerald-400 font-semibold block">5:15 PM – 5:45 PM</span>
                <span className="text-gray-300">{day.schedule?.dsa?.focus || 'C++ & DSA Problem Solving'}</span>
              </div>
              {isAiUnlocked && (
                <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 sm:col-span-2">
                  <span className="font-mono text-violet-400 font-semibold block">5:45 PM – 6:00 PM</span>
                  <span className="text-gray-300">{day.schedule?.sideTrack?.focus || 'Python & AI Side Track'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Tasks */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                Tasks ({visibleTasks.length})
              </span>
              <span className="text-[11px] text-gray-500 font-normal">Click checkmark to toggle</span>
            </div>

            <div className="space-y-2">
              {visibleTasks.map((task) => {
                const isTaskDone = !!tasks[task.id];
                return (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task.id, day.id)}
                    className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isTaskDone
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-gray-300'
                        : 'bg-white/5 border-white/5 hover:border-white/10 text-gray-200'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isTaskDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-500 hover:text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium ${isTaskDone ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-gray-400 uppercase">
                          {task.type}
                        </span>
                        <span className="text-[10px] text-indigo-400 font-mono">
                          {task.topicId}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Revision & Project Work if any */}
          {(day.revision || day.project) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {day.revision && (
                <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20">
                  <div className="text-xs font-semibold text-purple-300 flex items-center gap-1.5 mb-1">
                    <Repeat className="w-3.5 h-3.5" />
                    Spaced Revision
                  </div>
                  <div className="text-xs text-gray-300">{day.revision.focus}</div>
                </div>
              )}
              {day.project && (
                <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
                  <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5 mb-1">
                    <FolderGit2 className="w-3.5 h-3.5" />
                    Project Milestone
                  </div>
                  <div className="text-xs text-gray-300">{day.project.milestone}</div>
                </div>
              )}
            </div>
          )}

          {/* Personal Day Notes (Persisted) */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
            <div className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <FileEdit className="w-3.5 h-3.5 text-amber-400" />
              Personal Notes & Reflection (Auto-saved)
            </div>
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              onBlur={handleNoteBlur}
              placeholder="Record your breakthroughs, errors encountered, or key takeaways for this day..."
              rows={3}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

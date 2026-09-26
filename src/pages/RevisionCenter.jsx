import React, { useState, useMemo, useCallback } from 'react';
import {
  Repeat,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  History,
  ArrowRight,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function RevisionCenter() {
  const {
    roadmap,
    topics,
    tasks,
    revision,
    setTopicRevisionStatus,
    navigateTo,
    practice,
    practiceResources,
    stats,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState('all');

  // Helper to extract practice status safely (handles both boolean and object states)
  const getResourceStatus = useCallback((resId) => {
    const item = practice[resId];
    if (!item) return { isDone: false, timesPracticed: 0, lastPracticed: null };
    if (typeof item === 'boolean') {
      return { isDone: item, timesPracticed: item ? 1 : 0, lastPracticed: item ? 'Recorded' : null };
    }
    return {
      isDone: !!item.status,
      timesPracticed: item.timesPracticed || (item.status ? 1 : 0),
      lastPracticed: item.lastPracticed || null,
    };
  }, [practice]);

  // Rule-based topic status derived from actual user activity (Requirement 15)
  // 'Needs Revision': Topic had tasks, but not practiced recently or 0 tasks done
  // 'In Progress': Currently active topic with incomplete tasks
  // 'Completed': All tasks for this topic completed
  const topicActivityMap = useMemo(() => {
    const map = {};

    topics.forEach((t) => {
      let totalTasks = 0;
      let completedTasks = 0;
      let lastCompletedDay = null;

      roadmap.forEach((day) => {
        day.tasks.forEach((tsk) => {
          if (tsk.topicId === t.id) {
            totalTasks++;
            if (tasks[tsk.id]) {
              completedTasks++;
              lastCompletedDay = day.day;
            }
          }
        });
      });

      // Derived status based on actual task completion
      let derivedStatus = 'needs_revision';
      if (totalTasks > 0 && completedTasks === totalTasks) {
        derivedStatus = 'completed';
      } else if (completedTasks > 0) {
        derivedStatus = 'in_progress';
      }

      map[t.id] = {
        totalTasks,
        completedTasks,
        lastCompletedDay,
        derivedStatus,
      };
    });

    return map;
  }, [topics, roadmap, tasks]);

  // Today's scheduled revision from roadmap
  const todayRevision = stats.currentDay?.revision;

  // Filter topics based on category
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      if (activeCategory === 'all') return true;
      if (activeCategory === 'dsa') return t.id.includes('dsa') || t.id.includes('cpp');
      if (activeCategory === 'sql') return t.id.includes('sql') || t.id.includes('dbms');
      if (activeCategory === 'core-cs') return t.track === 'core-cs';
      if (activeCategory === 'system-design') return t.id === 'topic-system-design';
      if (activeCategory === 'python') return t.track === 'python';
      if (activeCategory === 'ai') return t.id.includes('genai') || t.id.includes('ai') || t.id.includes('gnn');
      return true;
    });
  }, [topics, activeCategory]);

  // Practice history using real persisted data (Requirement 14)
  const completedPracticeResources = useMemo(() => {
    return practiceResources
      .map((r) => {
        const s = getResourceStatus(r.id);
        return {
          ...r,
          ...s,
        };
      })
      .filter((r) => r.isDone || r.timesPracticed > 0)
      .sort((a, b) => (b.timesPracticed || 0) - (a.timesPracticed || 0));
  }, [practiceResources, getResourceStatus]);

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'dsa', label: 'DSA Revision' },
    { id: 'sql', label: 'SQL & DBMS' },
    { id: 'core-cs', label: 'Core CS' },
    { id: 'system-design', label: 'System Design' },
    { id: 'python', label: 'Python Track' },
    { id: 'ai', label: 'AI & GenAI' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-[#11131c] border border-white/5 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <Repeat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Revision Center & Spaced Repetition
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Rule-Based Algorithm
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Active recall tracker, activity-driven revision rules, and verified practice history
            </p>
          </div>
        </div>

        {/* Metric summary */}
        <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/5 shrink-0">
          <div className="text-right">
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Active Topics</div>
            <div className="text-sm font-bold font-mono text-indigo-300">
              {Object.values(topicActivityMap).filter((m) => m.completedTasks > 0).length} / {topics.length} In Rotation
            </div>
          </div>
        </div>
      </div>

      {/* Today's Prescribed Revision */}
      {todayRevision && (
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 bg-purple-950/15 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                Today&apos;s Prescribed Spaced Revision (Day {stats.currentDay.day})
              </span>
            </div>
            <button
              onClick={() => navigateTo('today')}
              className="text-xs font-semibold text-purple-300 hover:text-purple-200 flex items-center gap-1 cursor-pointer"
            >
              <span>View in Today&apos;s Mission</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-sm sm:text-base font-semibold text-white">
            {todayRevision.focus}
          </p>
          <div className="text-xs text-gray-400 mt-1 font-mono">
            Topic Key: <span className="text-purple-400">{todayRevision.topicId}</span>
          </div>
        </div>
      )}

      {/* Spaced Repetition Activity Rules Framework (Requirement 15: Clearly labeled, no fake AI) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Needs Revision
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Rule: Topic has scheduled roadmap tasks that have not yet been marked completed or require reinforcement.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            In Progress
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Rule: Active topic with partially completed tasks. Actively in rotation across current roadmap milestones.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Rule: 100% of tasks assigned to this topic in the 120-day roadmap are verified and completed.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Topics Spaced Repetition Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Repeat className="w-4 h-4 text-indigo-400" />
            Topic Activity & Spaced Review
          </h2>
          <span className="text-xs text-gray-400 font-mono">
            {filteredTopics.length} topics displayed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map((topic) => {
            const activity = topicActivityMap[topic.id] || { totalTasks: 0, completedTasks: 0, derivedStatus: 'needs_revision' };
            const userOverride = revision[topic.id]?.status;
            const effectiveStatus = userOverride || activity.derivedStatus;
            const lastUpdated = revision[topic.id]?.lastUpdated;

            const statusColors = {
              completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
              mastered: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
              in_progress: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
              needs_revision: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
            };

            const statusLabels = {
              completed: 'Completed',
              mastered: 'Completed',
              in_progress: 'In Progress',
              needs_revision: 'Needs Revision',
            };

            return (
              <div
                key={topic.id}
                className="p-5 rounded-3xl glass-panel border border-white/5 flex flex-col justify-between hover:border-white/10 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{topic.icon}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-gray-400 uppercase">
                      {topic.track}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1">{topic.name}</h3>
                  <div className="text-[11px] text-gray-400 line-clamp-2 mb-3">
                    {topic.subtopics.slice(0, 5).map((s) => s.title).join(', ')}...
                  </div>

                  {/* Activity Progress */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mb-1">
                    <span>Task Activity:</span>
                    <span className="text-white font-semibold">
                      {activity.completedTasks} / {activity.totalTasks} tasks
                    </span>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{
                        width: `${activity.totalTasks > 0 ? (activity.completedTasks / activity.totalTasks) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 space-y-2 mt-auto">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500 font-mono">Status:</span>
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        statusColors[effectiveStatus] || 'text-gray-400 bg-white/5 border-white/10'
                      }`}
                    >
                      {statusLabels[effectiveStatus] || effectiveStatus}
                    </span>
                  </div>

                  {/* Quick Toggle Controls */}
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    <button
                      onClick={() => setTopicRevisionStatus(topic.id, 'needs_revision')}
                      className={`py-1 text-[10px] font-semibold rounded-lg transition-colors cursor-pointer ${
                        effectiveStatus === 'needs_revision'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      Needs Work
                    </button>
                    <button
                      onClick={() => setTopicRevisionStatus(topic.id, 'in_progress')}
                      className={`py-1 text-[10px] font-semibold rounded-lg transition-colors cursor-pointer ${
                        effectiveStatus === 'in_progress'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => setTopicRevisionStatus(topic.id, 'completed')}
                      className={`py-1 text-[10px] font-semibold rounded-lg transition-colors cursor-pointer ${
                        effectiveStatus === 'completed' || effectiveStatus === 'mastered'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      Completed
                    </button>
                  </div>

                  {lastUpdated && (
                    <div className="text-[10px] text-gray-500 text-right font-mono mt-1">
                      Logged: {lastUpdated}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Practice History Section (Requirement 14: Resource, Category, Last Practiced, Times Practiced) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Practice Arcade History
              </h2>
              <p className="text-xs text-gray-400">
                Log of completed external interactive platforms with verified timestamps
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-purple-300 font-mono font-semibold bg-white/5 px-3 py-1 rounded-xl border border-white/5">
              {completedPracticeResources.length} Practiced
            </span>
            <button
              onClick={() => navigateTo('practice')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View Arcade</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {completedPracticeResources.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            <BookOpen className="w-5 h-5 text-gray-600 mx-auto mb-2" />
            No practice resources marked completed yet. Open Practice Arcade to begin!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 font-mono text-[11px]">
                  <th className="pb-3 font-semibold">Resource</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Last Practiced</th>
                  <th className="pb-3 font-semibold text-right">Times Practiced</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {completedPracticeResources.map((res) => (
                  <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 font-semibold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{res.name}</span>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-gray-400 uppercase">
                      {res.category}
                    </td>
                    <td className="py-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-gray-300">
                        {res.typeLabel || res.type}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-gray-400 text-[11px]">
                      {res.lastPracticed || 'Recorded'}
                    </td>
                    <td className="py-3 text-right font-mono text-purple-400 font-bold">
                      {res.timesPracticed}
                    </td>
                    <td className="py-3 text-right">
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

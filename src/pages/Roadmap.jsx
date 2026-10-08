import { useState, useMemo, Fragment } from 'react';
import {
  Map,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Filter,
  Search,
  Coffee,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DayDetailModal } from '../components/Modals/DayDetailModal';
import { bufferDays } from '../data/bufferDays.js';

export function Roadmap() {
  const {
    roadmap,
    phases,
    days,
    tasks,
    stats,
    navigateTo,
    isAiPythonTask,
    filterObjectivesForAiGate,
  } = useApp();
  const isAiUnlocked = stats?.aiTrackStatus?.isUnlocked;

  const [activePhaseId, setActivePhaseId] = useState(phases[0].id);
  const [expandedWeeks, setExpandedWeeks] = useState({ 1: true });
  const [statusFilter, setStatusFilter] = useState('all'); // all, completed, in_progress, not_started
  const [trackFilter, setTrackFilter] = useState('all'); // all, frontend, backend, devops, cloud, data, ai, python, dsa, core-cs
  const [searchQuery, setSearchQuery] = useState('');
  const [detailModalDayId, setDetailModalDayId] = useState(null);

  // Group roadmap days by phase and by week
  const groupedData = useMemo(() => {
    const data = {};
    phases.forEach((ph) => {
      data[ph.id] = {
        phase: ph,
        weeks: {},
      };
    });

    roadmap.forEach((day) => {
      if (!data[day.phase]) return;
      if (!data[day.phase].weeks[day.week]) {
        data[day.phase].weeks[day.week] = [];
      }
      data[day.phase].weeks[day.week].push(day);
    });

    return data;
  }, [roadmap, phases]);

  const toggleWeek = (weekNum) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [weekNum]: !prev[weekNum],
    }));
  };

  const expandAllWeeks = () => {
    const all = {};
    for (let i = 1; i <= 20; i++) all[i] = true;
    setExpandedWeeks(all);
  };

  const collapseAllWeeks = () => {
    setExpandedWeeks({});
  };

  // Filter days based on status & track & query
  const isDayMatchingFilters = (day) => {
    const isCompleted = !!days[day.id];
    const anyTaskDone = day.tasks.some((t) => tasks[t.id]);

    // Status filter
    if (statusFilter === 'completed' && !isCompleted) return false;
    if (statusFilter === 'in_progress' && (!anyTaskDone || isCompleted)) return false;
    if (statusFilter === 'not_started' && anyTaskDone) return false;

    // Track filter
    if (trackFilter !== 'all') {
      const topicIds = day.tasks.map((t) => t.topicId.toLowerCase());
      const matchesTrack = {
        frontend: () => topicIds.some((id) => id.includes('html') || id.includes('css') || id.includes('js') || id.includes('react') || id.includes('next') || id.includes('three')),
        backend: () => topicIds.some((id) => id.includes('node') || id.includes('express') || id.includes('mongo') || id.includes('mern')),
        devops: () => topicIds.some((id) => id.includes('devops') || id.includes('docker') || id.includes('git') || id.includes('linux')),
        cloud: () => topicIds.some((id) => id.includes('cloud') || id.includes('aws')),
        data: () => topicIds.some((id) => id.includes('data') || id.includes('sql') || id.includes('analytics') || id.includes('engineering')),
        ai: () => topicIds.some((id) => id.includes('genai') || id.includes('ai') || id.includes('gnn')),
        python: () => topicIds.some((id) => id.includes('python')),
        dsa: () => topicIds.some((id) => id.includes('dsa') || id.includes('cpp')),
        'core-cs': () => topicIds.some((id) => id.includes('sql') || id.includes('oop') || id.includes('dbms') || id.includes('os') || id.includes('cn') || id.includes('system-design')),
        aptitude: () => topicIds.some((id) => id.includes('aptitude')),
        sem5: () => topicIds.some((id) => id.includes('sem5')),
        career: () => topicIds.some((id) => id.includes('resume') || id.includes('communication') || id.includes('interview')),
      }[trackFilter]?.();

      if (!matchesTrack) return false;
    }

    // Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = day.title.toLowerCase().includes(q);
      const matchTask = day.tasks.some((t) => t.title.toLowerCase().includes(q));
      if (!matchTitle && !matchTask) return false;
    }

    return true;
  };

  const currentPhaseData = groupedData[activePhaseId];
  const activePhaseObj = phases.find((p) => p.id === activePhaseId) || phases[0];
  const activePhaseStats = stats.phaseStats[activePhaseId] || { percent: 0, completedDays: 0, totalDays: 0, completedTasks: 0, totalTasks: 0 };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#11131c] border border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              120-Day Interactive Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Phases → Weeks → Days → Tasks hierarchy with verified completion states
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAllWeeks}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium border border-white/5 transition-colors cursor-pointer"
          >
            Expand All Weeks
          </button>
          <button
            onClick={collapseAllWeeks}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium border border-white/5 transition-colors cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Horizontal Phase Tabs Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {phases.map((ph, idx) => {
          const phStat = stats.phaseStats[ph.id] || { percent: 0 };
          const isActive = ph.id === activePhaseId;
          return (
            <button
              key={ph.id}
              onClick={() => setActivePhaseId(ph.id)}
              className={`px-4 py-3 rounded-2xl border text-left shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-950/40 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:text-gray-200 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between gap-4 text-[10px] font-mono">
                <span>Phase {idx + 1}</span>
                <span className="font-bold" style={{ color: ph.color }}>
                  {phStat.percent}%
                </span>
              </div>
              <div className="text-xs font-semibold mt-1 text-white line-clamp-1 max-w-[130px]">
                {ph.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Phase Overview Card */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                Phase {phases.findIndex((p) => p.id === activePhaseObj.id) + 1} of 11
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Days {activePhaseObj.startDay}–{activePhaseObj.endDay}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">{activePhaseObj.name}</h2>
            <p className="text-xs text-gray-300 mt-1 max-w-2xl">{activePhaseObj.description}</p>
          </div>

          <div className="flex items-center gap-6 shrink-0 bg-white/5 p-4 rounded-2xl border border-white/5">
            <div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Phase Progress</div>
              <div className="text-2xl font-bold font-mono text-white mt-0.5" style={{ color: activePhaseObj.color }}>
                {activePhaseStats.percent}%
              </div>
            </div>
            <div className="border-l border-white/10 pl-6">
              <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Days Completed</div>
              <div className="text-sm font-bold font-mono text-white mt-0.5">
                {activePhaseStats.completedDays} / {activePhaseStats.totalDays} days
              </div>
              <div className="text-[10px] text-gray-500 font-mono">
                {activePhaseStats.completedTasks} / {activePhaseStats.totalTasks} tasks
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search inside roadmap */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search days, topics, tasks in this phase..."
            className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[11px] text-gray-500 font-semibold uppercase flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" />
            Status:
          </span>
          {['all', 'in_progress', 'completed', 'not_started'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-gray-200'
              }`}
            >
              {st.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Track Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            className="bg-black/30 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-gray-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Tracks</option>
            <option value="frontend">Frontend Stack</option>
            <option value="backend">Backend & MERN</option>
            <option value="devops">DevOps</option>
            <option value="cloud">Cloud</option>
            <option value="data">Data Stack</option>
            <option value="ai">AI Stack</option>
            <option value="python">Python</option>
            <option value="dsa">C++ & DSA</option>
            <option value="core-cs">Core CS</option>
            <option value="aptitude">Placement Aptitude</option>
            <option value="sem5">Semester 5 University</option>
            <option value="career">Career Prep</option>
          </select>
        </div>
      </div>

      {/* Weeks and Days Hierarchy */}
      <div className="space-y-6">
        {currentPhaseData && Object.keys(currentPhaseData.weeks).map((weekNum) => {
          const weekDays = currentPhaseData.weeks[weekNum];
          const isLastPhaseWeekSegment = weekDays.at(-1)?.id === roadmap
            .filter((day) => day.week === Number(weekNum))
            .at(-1)?.id;
          const isExpanded = !!expandedWeeks[weekNum];
          const filteredDays = weekDays.filter(isDayMatchingFilters);

          const weekCompletedDays = weekDays.filter((d) => days[d.id]).length;
          const weekPercent = Math.round((weekCompletedDays / weekDays.length) * 100);

          return (
            <div key={weekNum} className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
              {/* Week Accordion Header */}
              <button
                onClick={() => toggleWeek(weekNum)}
                className="w-full p-5 flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">WEEK {weekNum < 10 ? `0${weekNum}` : weekNum}</span>
                      <span className="text-xs text-gray-400 font-mono">
                        ({weekDays.length} study days • Mon–Sat)
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                      {weekDays.map((d) => d.title.replace(/^Day \d+:\s*/, '')).join(' • ')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-mono font-bold text-indigo-400">{weekPercent}% Done</span>
                    <div className="text-[10px] text-gray-500 font-mono">
                      {weekCompletedDays} / {weekDays.length} days
                    </div>
                  </div>
                  <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${weekPercent}%` }}
                    />
                  </div>
                </div>
              </button>

              {/* Week Content (Days Grid) */}
              {isExpanded && (
                <div className="p-5 border-t border-white/5 space-y-4">
                  {filteredDays.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-500">
                      No days match the active filters in this week.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredDays.map((day) => {
                        const isDone = !!days[day.id];
                        const activeTasks = isAiUnlocked
                          ? day.tasks
                          : day.tasks.filter((t) => !isAiPythonTask(t));
                        const completedTasksCount = activeTasks.filter((t) => tasks[t.id]).length;
                        const displayObjectives = filterObjectivesForAiGate
                          ? filterObjectivesForAiGate(day.objectives, isAiUnlocked)
                          : day.objectives;
                        const displayDayNumber = day.day;
                        return (
                          <Fragment key={day.id}>
                            <div
                              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                                isDone
                                  ? 'bg-emerald-950/20 border-emerald-500/30 shadow-sm'
                                  : 'bg-black/30 border-white/5 hover:border-white/15'
                              }`}
                            >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-white/5 text-gray-300">
                                  Day {displayDayNumber}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[11px] font-mono flex items-center gap-1 ${isDone ? 'text-emerald-400' : 'text-gray-500'}`}>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    {completedTasksCount}/{activeTasks.length} tasks
                                  </span>
                                </div>
                              </div>

                              <h4 className="text-xs font-bold text-white line-clamp-1 mb-1.5">
                                {day.title}
                              </h4>

                              <p className="text-[11px] text-gray-400 line-clamp-2 mb-3">
                                {displayObjectives.join(' • ')}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                              <button
                                onClick={() => setDetailModalDayId(day.id)}
                                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                              >
                                View Details & Schedule →
                              </button>

                              <button
                                onClick={() => navigateTo('today', day.id)}
                                className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
                              >
                                Focus
                              </button>
                            </div>
                          </div>

                          {/* Buffer / Rest / Exam Days scheduled after this study day */}
                          {bufferDays
                            .filter((b) => b.afterStudyDay === day.day)
                            .map((buffer) => (
                              <div
                                key={buffer.id}
                                className="p-4 rounded-2xl border border-dashed border-purple-500/30 bg-purple-950/15 flex flex-col justify-between text-left"
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                                      Calendar Day {buffer.calendarDay}
                                    </span>
                                    <span className="text-[10px] text-purple-400 font-mono flex items-center gap-1 uppercase font-semibold">
                                      <Coffee className="w-3 h-3" />
                                      {buffer.type} Buffer
                                    </span>
                                  </div>
                                  <h4 className="text-xs font-bold text-purple-200 mb-1">
                                    {buffer.title}
                                  </h4>
                                  <p className="text-[11px] text-gray-400 mb-3">
                                    {buffer.description}
                                  </p>
                                </div>
                                <div className="text-[10px] text-purple-400/80 font-mono pt-2 border-t border-purple-500/10 mt-auto flex items-center justify-between">
                                  <span>0.0 Scheduled Study Hours</span>
                                  <span className="text-gray-400">Strictly Non-Study</span>
                                </div>
                              </div>
                            ))}
                        </Fragment>
                      );
                    })}

                      {/* Sunday Rest Day Card (Visually Distinct, Zero Mandatory Tasks) */}
                      {isLastPhaseWeekSegment && (
                        <div className="p-4 rounded-2xl border border-dashed border-amber-500/20 bg-amber-950/10 flex flex-col justify-between text-left">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                              Sunday
                            </span>
                            <span className="text-[10px] text-amber-400/80 font-mono flex items-center gap-1">
                              <Coffee className="w-3 h-3" />
                              REST DAY
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-amber-200 mb-1">
                            Complete Rest & Recharge Day
                          </h4>
                          <p className="text-[11px] text-gray-400">
                            Zero mandatory study tasks. Take a full mental break, spend time outdoors, or optional light review if you feel energized.
                          </p>
                        </div>
                        <div className="text-[10px] text-amber-400/60 font-mono pt-3 border-t border-amber-500/10 mt-auto">
                          Non-penalized streak rest day
                        </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Day Detail Modal if opened */}
      {detailModalDayId && (
        <DayDetailModal
          dayId={detailModalDayId}
          onClose={() => setDetailModalDayId(null)}
        />
      )}
    </div>
  );
}

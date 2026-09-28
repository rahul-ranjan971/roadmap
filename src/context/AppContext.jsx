import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { roadmap } from '../data/roadmap';
import { phases } from '../data/phases';
import { topics } from '../data/topics';
import { projects } from '../data/projects';
import { careers } from '../data/careers';
import { practiceResources } from '../data/practiceResources';
import { quotes } from '../data/quotes';
import { STORAGE_KEYS, loadFromStorage, saveToStorage, exportAllData, importAllData } from '../utils/storage';
import { mergeProgressImport, validateProgressImport } from '../utils/progressImport';
import { getQuoteIndexForDate, todayISO } from '../utils/dateHelpers';

// Days 1-6 cover HTML/CSS fundamentals. When learner already knows HTML/CSS,
// these days are auto-completed so the journey starts at JavaScript (day-007).
const HTML_CSS_DAY_IDS = ['day-001', 'day-002', 'day-003', 'day-004', 'day-005', 'day-006'];

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Learning level: 'html-css-known' (default) or 'html-css-beginner'
  const [learningLevel, setLearningLevelState] = useState(
    () => loadFromStorage(STORAGE_KEYS.settings, { learningLevel: 'html-css-known' })?.learningLevel || 'html-css-known'
  );

  const setLearningLevel = useCallback((level) => {
    setLearningLevelState(level);
    const settings = loadFromStorage(STORAGE_KEYS.settings, {});
    saveToStorage(STORAGE_KEYS.settings, { ...settings, learningLevel: level });
  }, []);

  const htmlCssKnown = learningLevel === 'html-css-known';

  // Navigation state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDayId, setSelectedDayId] = useState(() => htmlCssKnown ? 'day-007' : 'day-001');
  const [searchOpen, setSearchOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(() => {
    // Only show on first visit of the session
    const seen = sessionStorage.getItem('cc_intro_seen');
    return !seen;
  });

  // Toast notifications (Task complete, Day complete, Milestone complete)
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).slice(2, 6);
    setToasts(prev => [...prev.slice(-2), { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Persistent storage state
  const [tasks, setTasks] = useState(() => loadFromStorage(STORAGE_KEYS.tasks, {}));
  const [days, setDays] = useState(() => loadFromStorage(STORAGE_KEYS.days, {}));
  const [milestones, setMilestones] = useState(() => loadFromStorage(STORAGE_KEYS.milestones, {}));
  const [checklists, setChecklists] = useState(() => loadFromStorage(STORAGE_KEYS.checklists || 'career-compass:v1:checklists', {}));
  const [practice, setPractice] = useState(() => loadFromStorage(STORAGE_KEYS.practice, {}));
  const [revision, setRevision] = useState(() => loadFromStorage(STORAGE_KEYS.revision, {}));
  const [notes, setNotes] = useState(() => loadFromStorage(STORAGE_KEYS.notes, {}));
  const [streaks, setStreaks] = useState(() => loadFromStorage(STORAGE_KEYS.streaks, { current: 0, longest: 0, lastStudyDate: null }));

  // Multi-tab synchronization (Requirement 21)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (!e.key || !e.newValue) return;
      try {
        const val = JSON.parse(e.newValue);
        if (e.key === STORAGE_KEYS.tasks) setTasks(val || {});
        else if (e.key === STORAGE_KEYS.days) setDays(val || {});
        else if (e.key === STORAGE_KEYS.milestones) setMilestones(val || {});
        else if (e.key === STORAGE_KEYS.checklists) setChecklists(val || {});
        else if (e.key === STORAGE_KEYS.practice) setPractice(val || {});
        else if (e.key === STORAGE_KEYS.revision) setRevision(val || {});
        else if (e.key === STORAGE_KEYS.notes) setNotes(val || {});
        else if (e.key === STORAGE_KEYS.streaks) setStreaks(val || { current: 0, longest: 0, lastStudyDate: null });
      } catch {
        // Safe fallback on unparseable cross-tab message
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Helper to persist and set state
  const updateTasks = useCallback((updater) => {
    setTasks(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveToStorage(STORAGE_KEYS.tasks, next);
      return next;
    });
  }, []);

  const updateDays = useCallback((updater) => {
    setDays(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveToStorage(STORAGE_KEYS.days, next);
      return next;
    });
  }, []);

  const updateMilestones = useCallback((updater) => {
    setMilestones(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveToStorage(STORAGE_KEYS.milestones, next);
      return next;
    });
  }, []);

  const updateChecklists = useCallback((updater) => {
    setChecklists(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveToStorage('career-compass:v1:checklists', next);
      return next;
    });
  }, []);

  const updatePractice = useCallback((updater) => {
    setPractice(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveToStorage(STORAGE_KEYS.practice, next);
      return next;
    });
  }, []);

  const updateRevision = useCallback((updater) => {
    setRevision(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveToStorage(STORAGE_KEYS.revision, next);
      return next;
    });
  }, []);

  const updateNotes = useCallback((updater) => {
    setNotes(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveToStorage(STORAGE_KEYS.notes, next);
      return next;
    });
  }, []);

  // Update streak when a day is completed
  const recordDayStudy = useCallback((_dayId) => {
    const today = todayISO();
    setStreaks(prev => {
      if (prev.lastStudyDate === today) return prev;

      let nextCurrent = prev.current;
      if (prev.lastStudyDate) {
        const last = new Date(prev.lastStudyDate);
        const now = new Date(today);
        const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));
        if (diffDays <= 2) {
          nextCurrent += 1;
        } else {
          nextCurrent = 1;
        }
      } else {
        nextCurrent = 1;
      }

      const next = {
        current: nextCurrent,
        longest: Math.max(nextCurrent, prev.longest),
        lastStudyDate: today,
      };
      saveToStorage(STORAGE_KEYS.streaks, next);
      return next;
    });
  }, []);

  // Toggle task completion
  const toggleTask = useCallback((taskId, dayId) => {
    let wasNewlyCompleted = false;

    updateTasks(prev => {
      const nextDone = !prev[taskId];
      wasNewlyCompleted = nextDone;
      const next = { ...prev, [taskId]: nextDone };

      // Check if all tasks in day are now complete
      const dayObj = roadmap.find(d => d.id === dayId);
      if (dayObj && dayObj.tasks && dayObj.tasks.length > 0) {
        const allDone = dayObj.tasks.every(t => (t.id === taskId ? next[taskId] : next[t.id]));
        updateDays(prevDays => {
          const nextDays = { ...prevDays, [dayId]: allDone };
          if (allDone) {
            recordDayStudy(dayId);
            showToast('DAY COMPLETE', 'day');
          }
          return nextDays;
        });
      }

      return next;
    });

    if (wasNewlyCompleted) {
      showToast('✓ Task completed', 'task');
    }
  }, [updateTasks, updateDays, recordDayStudy, showToast]);

  // Toggle day completion explicitly
  const toggleDay = useCallback((dayId) => {
    updateDays(prev => {
      const nextStatus = !prev[dayId];
      const next = { ...prev, [dayId]: nextStatus };
      if (nextStatus) {
        // Also mark all tasks of this day completed
        const dayObj = roadmap.find(d => d.id === dayId);
        if (dayObj?.tasks) {
          updateTasks(prevTasks => {
            const nextTasks = { ...prevTasks };
            dayObj.tasks.forEach(t => { nextTasks[t.id] = true; });
            return nextTasks;
          });
        }
        recordDayStudy(dayId);
        showToast('DAY COMPLETE', 'day');
      }
      return next;
    });
  }, [updateDays, updateTasks, recordDayStudy, showToast]);

  // Toggle project milestone
  const toggleMilestone = useCallback((milestoneId) => {
    let isCompleted = false;
    updateMilestones(prev => {
      isCompleted = !prev[milestoneId];
      return {
        ...prev,
        [milestoneId]: isCompleted,
      };
    });
    if (isCompleted) {
      showToast('PROJECT MILESTONE COMPLETE', 'milestone');
    }
  }, [updateMilestones, showToast]);

  // Toggle project checklist item
  const toggleChecklist = useCallback((checklistKey) => {
    updateChecklists(prev => ({
      ...prev,
      [checklistKey]: !prev[checklistKey],
    }));
  }, [updateChecklists]);

  // Toggle practice resource completed with history tracking
  const togglePractice = useCallback((practiceId) => {
    const today = todayISO();
    let isMarked = false;

    updatePractice(prev => {
      const cur = prev[practiceId];
      const currentlyDone = typeof cur === 'boolean' ? cur : !!cur?.status;
      const currentTimes = typeof cur === 'object' && cur?.timesPracticed ? cur.timesPracticed : (currentlyDone ? 1 : 0);
      const nextStatus = !currentlyDone;
      isMarked = nextStatus;

      return {
        ...prev,
        [practiceId]: {
          status: nextStatus,
          timesPracticed: nextStatus ? currentTimes + 1 : currentTimes,
          lastPracticed: nextStatus ? today : (cur?.lastPracticed || today),
        },
      };
    });

    if (isMarked) {
      showToast('Practice recorded ✓', 'practice');
    }
  }, [updatePractice, showToast]);

  // Mark revision status (needs_revision, in_progress, completed)
  const setTopicRevisionStatus = useCallback((topicId, status) => {
    updateRevision(prev => ({
      ...prev,
      [topicId]: {
        status,
        lastUpdated: todayISO(),
      },
    }));
  }, [updateRevision]);

  // Save note for a day
  const setDayNote = useCallback((dayId, text) => {
    updateNotes(prev => ({
      ...prev,
      [dayId]: text,
    }));
  }, [updateNotes]);

  // Dismiss intro
  const closeIntro = useCallback(() => {
    sessionStorage.setItem('cc_intro_seen', 'true');
    setIntroOpen(false);
  }, []);

  // Total statistics calculations
  const stats = useMemo(() => {
    const totalDays = roadmap.length;
    const completedDays = Object.values(days).filter(Boolean).length;

    let totalTasks = 0;
    let completedTasks = 0;

    // Track-wise task stats
    const trackStats = {
      main: { total: 0, completed: 0 },
      'core-cs': { total: 0, completed: 0 },
      'cpp-dsa': { total: 0, completed: 0 },
      python: { total: 0, completed: 0 },
    };

    roadmap.forEach(day => {
      day.tasks.forEach(t => {
        totalTasks++;
        const isDone = !!tasks[t.id];
        if (isDone) completedTasks++;

        // Topic track categorization
        const topic = topics.find(top => top.id === t.topicId);
        const track = topic?.track || 'main';
        if (trackStats[track]) {
          trackStats[track].total++;
          if (isDone) trackStats[track].completed++;
        }
      });
    });

    // Project milestone stats
    let totalMilestones = 0;
    let completedMilestones = 0;
    projects.forEach(p => {
      p.milestones.forEach(m => {
        totalMilestones++;
        if (milestones[m.id]) completedMilestones++;
      });
    });

    // Practice stats (safely handles boolean and object status)
    const totalPractice = practiceResources.length;
    const completedPractice = Object.values(practice).filter(p => (typeof p === 'boolean' ? p : !!p?.status)).length;

    // Phase progress stats
    const phaseStats = {};
    phases.forEach(ph => {
      const phaseDays = roadmap.filter(d => d.phase === ph.id);
      let pTasks = 0;
      let pTasksDone = 0;
      phaseDays.forEach(d => {
        d.tasks.forEach(t => {
          pTasks++;
          if (tasks[t.id]) pTasksDone++;
        });
      });
      phaseStats[ph.id] = {
        totalDays: phaseDays.length,
        completedDays: phaseDays.filter(d => days[d.id]).length,
        totalTasks: pTasks,
        completedTasks: pTasksDone,
        percent: pTasks > 0 ? Math.round((pTasksDone / pTasks) * 100) : 0,
      };
    });

    // Determine current day (first uncompleted day, skipping HTML/CSS days when known)
    const firstIncompleteDay = roadmap.find(d => {
      if (htmlCssKnown && HTML_CSS_DAY_IDS.includes(d.id)) return false;
      return !days[d.id];
    });
    const currentDay = firstIncompleteDay || (htmlCssKnown ? roadmap.find(d => d.id === 'day-007') : roadmap[0]) || roadmap[0];
    const currentPhase = phases.find(p => p.id === currentDay.phase) || phases[0];

    return {
      totalDays,
      completedDays,
      daysPercent: Math.round((completedDays / totalDays) * 100),
      totalTasks,
      completedTasks,
      tasksPercent: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalMilestones,
      completedMilestones,
      milestonesPercent: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0,
      totalPractice,
      completedPractice,
      practicePercent: totalPractice > 0 ? Math.round((completedPractice / totalPractice) * 100) : 0,
      trackStats,
      phaseStats,
      currentDay,
      currentPhase,
    };
  }, [tasks, days, milestones, practice, htmlCssKnown]);

  // Today's deterministic quote with persistence
  const todayQuote = useMemo(() => {
    const today = todayISO();
    const storedDate = loadFromStorage(STORAGE_KEYS.quoteDate);
    const storedIndex = loadFromStorage(STORAGE_KEYS.quoteIndex);

    let idx;
    if (storedDate === today && typeof storedIndex === 'number' && storedIndex >= 0 && storedIndex < quotes.length) {
      idx = storedIndex;
    } else {
      idx = getQuoteIndexForDate(new Date(), quotes.length);
      saveToStorage(STORAGE_KEYS.quoteDate, today);
      saveToStorage(STORAGE_KEYS.quoteIndex, idx);
    }
    return quotes[idx] || quotes[0];
  }, []);

  // Dynamically derive Today's active mission tracks without inventing data (Requirements 9 & 18)
  const todayMission = useMemo(() => {
    const day = stats.currentDay;
    if (!day) return { day: roadmap[0], sections: [] };

    const sections = [];

    // Main Track
    const mainTasks = day.tasks.filter(t => {
      const top = topics.find(tp => tp.id === t.topicId);
      return !top || top.track === 'main';
    });
    if (mainTasks.length > 0 || day.schedule?.mainTrack) {
      sections.push({
        id: 'main',
        label: 'Main Track',
        badge: 'Main Stack',
        color: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10',
        focus: day.schedule?.mainTrack?.focus || mainTasks[0]?.title || 'Main Curriculum Focus',
        tasks: mainTasks,
      });
    }

    // Core CS
    const coreTasks = day.tasks.filter(t => {
      const top = topics.find(tp => tp.id === t.topicId);
      return top?.track === 'core-cs';
    });
    if (coreTasks.length > 0 || day.schedule?.coreCS) {
      sections.push({
        id: 'core-cs',
        label: 'Core CS',
        badge: 'System Design & CS',
        color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
        focus: day.schedule?.coreCS?.focus || coreTasks[0]?.title || 'System Design & Fundamentals',
        tasks: coreTasks,
      });
    }

    // DSA with C++
    const dsaTasks = day.tasks.filter(t => {
      const top = topics.find(tp => tp.id === t.topicId);
      return top?.track === 'cpp-dsa' || t.topicId.includes('dsa') || t.topicId.includes('cpp');
    });
    if (dsaTasks.length > 0 || day.schedule?.dsa) {
      sections.push({
        id: 'dsa',
        label: 'DSA with C++',
        badge: 'Problem Solving',
        color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
        focus: day.schedule?.dsa?.focus || dsaTasks[0]?.title || 'Algorithm Problem Solving',
        tasks: dsaTasks,
      });
    }

    // Python Track
    const pythonTasks = day.tasks.filter(t => {
      const top = topics.find(tp => tp.id === t.topicId);
      return top?.track === 'python' || t.topicId.includes('python');
    });
    if (pythonTasks.length > 0 || day.schedule?.sideTrack) {
      sections.push({
        id: 'python',
        label: 'Python Track',
        badge: 'Python & AI',
        color: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
        focus: day.schedule?.sideTrack?.focus || pythonTasks[0]?.title || 'Python Companion Practice',
        tasks: pythonTasks,
      });
    }

    // Project (only if present that day)
    if (day.project?.milestone) {
      sections.push({
        id: 'project',
        label: 'Project Milestone',
        badge: 'Flagship Portfolio',
        color: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
        focus: day.project.milestone,
        tasks: [],
      });
    }

    // Revision (only if present that day)
    if (day.revision?.focus) {
      sections.push({
        id: 'revision',
        label: 'Spaced Revision',
        badge: 'Recall Practice',
        color: 'border-violet-500/30 text-violet-400 bg-violet-500/10',
        focus: day.revision.focus,
        tasks: [],
      });
    }

    // Practice Arcade (if scheduled or matching today's active tracks)
    const matchingPractice = practiceResources.find(r => {
      if (day.practice?.resourceId && r.id === day.practice.resourceId) return true;
      return day.tasks.some(t => {
        if (r.category === 'css' && t.topicId.includes('css')) return true;
        if (r.category === 'javascript' && (t.topicId.includes('js') || t.topicId.includes('javascript'))) return true;
        if (r.category === 'git' && t.topicId.includes('git')) return true;
        if (r.category === 'sql' && (t.topicId.includes('sql') || t.topicId.includes('dbms'))) return true;
        if (r.category === 'dsa' && (t.topicId.includes('dsa') || t.topicId.includes('cpp'))) return true;
        if (r.category === 'python' && t.topicId.includes('python')) return true;
        if (r.category === 'system-design' && (t.topicId.includes('system') || t.topicId.includes('design'))) return true;
        return false;
      });
    });

    if (matchingPractice) {
      sections.push({
        id: 'practice',
        label: 'Practice Arcade',
        badge: matchingPractice.typeLabel || 'Interactive',
        color: 'border-pink-500/30 text-pink-400 bg-pink-500/10',
        focus: `${matchingPractice.name} (${matchingPractice.category.toUpperCase()})`,
        resource: matchingPractice,
        tasks: [],
      });
    }

    return {
      day,
      sections,
    };
  }, [stats.currentDay]);

  // Export / Import / Reset progress
  const exportProgress = useCallback(() => {
    const data = exportAllData();
    data['career-compass:v1:checklists'] = checklists;
    data['checklists'] = checklists;
    data[STORAGE_KEYS.quoteDate] = loadFromStorage(STORAGE_KEYS.quoteDate);
    data[STORAGE_KEYS.quoteIndex] = loadFromStorage(STORAGE_KEYS.quoteIndex);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-compass-backup-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Export file downloaded', 'info');
  }, [checklists, showToast]);

  const importProgress = useCallback((jsonString) => {
    try {
      if (!jsonString || typeof jsonString !== 'string') {
        throw new Error('Invalid input: Expected a JSON string');
      }
      const parsed = JSON.parse(jsonString);
      const validation = validateProgressImport(parsed);
      if (!validation.success) return validation;
      const imported = mergeProgressImport(validation.updates, validation.presentFields, {
        tasks,
        days,
        milestones,
        checklists,
        practice,
        revision,
        notes,
        streaks,
      });
      if (!importAllData(imported)) {
        throw new Error('Could not save backup data to this browser');
      }

      if (Object.hasOwn(imported, STORAGE_KEYS.tasks)) setTasks(imported[STORAGE_KEYS.tasks]);
      if (Object.hasOwn(imported, STORAGE_KEYS.days)) setDays(imported[STORAGE_KEYS.days]);
      if (Object.hasOwn(imported, STORAGE_KEYS.milestones)) setMilestones(imported[STORAGE_KEYS.milestones]);
      if (Object.hasOwn(imported, STORAGE_KEYS.checklists)) setChecklists(imported[STORAGE_KEYS.checklists]);
      if (Object.hasOwn(imported, STORAGE_KEYS.practice)) setPractice(imported[STORAGE_KEYS.practice]);
      if (Object.hasOwn(imported, STORAGE_KEYS.revision)) setRevision(imported[STORAGE_KEYS.revision]);
      if (Object.hasOwn(imported, STORAGE_KEYS.notes)) setNotes(imported[STORAGE_KEYS.notes]);
      if (Object.hasOwn(imported, STORAGE_KEYS.streaks)) setStreaks(imported[STORAGE_KEYS.streaks]);

      showToast('Progress imported successfully', 'info');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [
    checklists,
    days,
    milestones,
    notes,
    practice,
    revision,
    showToast,
    streaks,
    tasks,
  ]);

  const resetProgress = useCallback(() => {
    setTasks({});
    setDays({});
    setMilestones({});
    setChecklists({});
    setPractice({});
    setRevision({});
    setNotes({});
    setStreaks({ current: 0, longest: 0, lastStudyDate: null });

    saveToStorage(STORAGE_KEYS.tasks, {});
    saveToStorage(STORAGE_KEYS.days, {});
    saveToStorage(STORAGE_KEYS.milestones, {});
    saveToStorage('career-compass:v1:checklists', {});
    saveToStorage(STORAGE_KEYS.practice, {});
    saveToStorage(STORAGE_KEYS.revision, {});
    saveToStorage(STORAGE_KEYS.notes, {});
    saveToStorage(STORAGE_KEYS.streaks, { current: 0, longest: 0, lastStudyDate: null });
    showToast('Progress has been reset', 'info');
  }, [showToast]);

  // Quick navigation helper
  const navigateTo = useCallback((tab, dayId = null) => {
    setActiveTab(tab);
    if (dayId) setSelectedDayId(dayId);
    else if (tab === 'today') setSelectedDayId(stats.currentDay.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stats.currentDay]);

  const value = {
    // Navigation
    activeTab,
    setActiveTab,
    selectedDayId,
    setSelectedDayId,
    searchOpen,
    setSearchOpen,
    introOpen,
    setIntroOpen,
    closeIntro,
    navigateTo,

    // Raw Data
    roadmap,
    phases,
    topics,
    projects,
    careers,
    practiceResources,
    quotes,
    todayQuote,

    // User State
    tasks,
    days,
    milestones,
    checklists,
    practice,
    revision,
    notes,
    streaks,

    // Feedback Toasts
    toasts,
    showToast,
    dismissToast,

    // Handlers
    toggleTask,
    toggleDay,
    toggleMilestone,
    toggleChecklist,
    togglePractice,
    setTopicRevisionStatus,
    setDayNote,

    // Backup & Restore
    exportProgress,
    importProgress,
    resetProgress,

    // Computed Stats & Dynamic Missions
    stats,
    todayMission,

    // Learning Level (HTML/CSS skip)
    htmlCssKnown,
    learningLevel,
    setLearningLevel,
    HTML_CSS_DAY_IDS,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}

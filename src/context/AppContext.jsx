import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
import { HTML_CSS_DAY_IDS, getActiveGlobalDayNumber } from '../utils/roadmapSchedule';
import { useAuth } from './AuthContext';
import { navigate, normalizePath } from '../utils/router';
import {
  loadProgress as dbLoadProgress,
  loadSettings as dbLoadSettings,
  saveTaskProgress as dbSaveTask,
  saveTaskProgressBatch as dbSaveTaskBatch,
  saveSettings as dbSaveSettings,
} from '../lib/supabaseHelpers';

// HTML/CSS days are removed from the active roadmap for learners who already know them.
// The remaining active curriculum is rebased to the shared global day count so each
// track continues from its own Day 1 without the old JavaScript Day 7 offset.
export const getDisplayDayNumber = (day, isHtmlCssKnown = false) => getActiveGlobalDayNumber(day, isHtmlCssKnown);

export const isAiPythonTopicId = (topicId = '') => {
  if (!topicId) return false;
  return (
    topicId.includes('python') ||
    topicId.includes('genai') ||
    topicId.includes('ai-engineering') ||
    topicId.includes('gnn')
  );
};

export const isAiPythonTask = (t) => {
  if (!t || !t.topicId) return false;
  return isAiPythonTopicId(t.topicId);
};

export const filterObjectivesForAiGate = (objectives = [], isAiUnlocked = false) => {
  if (isAiUnlocked) return objectives;
  return (objectives || [])
    .filter((obj) => {
      const lower = obj.toLowerCase();
      if (
        lower.includes('llm') ||
        lower.includes('genai') ||
        lower.includes('ai engineering') ||
        lower.includes('deep learning')
      ) {
        return false;
      }
      if (/python/i.test(lower) && !/c\+\+|dsa|javascript|js/i.test(lower)) {
        return false;
      }
      return true;
    })
    .map((obj) =>
      obj
        .replace(/\s*(?:and|,)\s*Python(?:\s+basics)?/gi, '')
        .replace(/Python\s+and\s*/gi, '')
        .trim()
    );
};

export const checkIsAiTrackUnlocked = (daysMap = {}) => {
  const webDevDays = roadmap.filter(d => d.day >= 1 && d.day <= 52);
  const isWebDevDone = webDevDays.length > 0 && webDevDays.every(d => !!daysMap[d.id]);
  const cloudDockerDays = roadmap.filter(d => d.day >= 53 && d.day <= 72);
  const isCloudDockerDone = cloudDockerDays.length > 0 && cloudDockerDays.every(d => !!daysMap[d.id]);
  return isWebDevDone && isCloudDockerDone;
};

const AppContext = createContext(null);

// Build a day-id lookup for task-ids so we can populate day_id on Supabase writes
const taskToDayMap = {};
roadmap.forEach(day => day.tasks.forEach(t => { taskToDayMap[t.id] = day.id; }));

export function AppProvider({ children }) {
  const { user } = useAuth();
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

  // Navigation state initialized from URL if a valid tab is present
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === 'undefined') return 'dashboard';
    const clean = normalizePath().replace(/^\//, '');
    const validTabs = [
      'dashboard', 'today', 'roadmap', 'practice', 'revision',
      'projects', 'careers', 'dsa', 'core-cs', 'python', 'analytics', 'settings'
    ];
    return validTabs.includes(clean) ? clean : 'dashboard';
  });
  const [selectedDayId, setSelectedDayId] = useState('day-001');
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

  // --- Supabase sync: load from DB on login, migrate localStorage data on first login ---
  const supabaseSynced = useRef(false);
  const activeUserIdRef = useRef(user?.id ?? null);
  const dbWriteQueue = useRef(Promise.resolve());

  // Queue a Supabase write so they run in order and errors are caught silently
  const queueDbWrite = useCallback((fn) => {
    if (!user) return;
    dbWriteQueue.current = dbWriteQueue.current.then(fn).catch((err) => {
      console.warn('[CareerCompass] Supabase write failed:', err.message);
    });
  }, [user]);

  // Persist settings blob to Supabase (debounced via queue)
  const syncSettingsToDb = useCallback((overrides = {}) => {
    if (!user) return;
    queueDbWrite(async () => {
      const settingsBlob = {
        milestones: overrides.milestones ?? loadFromStorage(STORAGE_KEYS.milestones, {}),
        checklists: overrides.checklists ?? loadFromStorage(STORAGE_KEYS.checklists, {}),
        practice: overrides.practice ?? loadFromStorage(STORAGE_KEYS.practice, {}),
        revision: overrides.revision ?? loadFromStorage(STORAGE_KEYS.revision, {}),
        notes: overrides.notes ?? loadFromStorage(STORAGE_KEYS.notes, {}),
        streaks: overrides.streaks ?? loadFromStorage(STORAGE_KEYS.streaks, { current: 0, longest: 0, lastStudyDate: null }),
        learningLevel: overrides.learningLevel ?? loadFromStorage(STORAGE_KEYS.settings, {})?.learningLevel ?? 'html-css-known',
      };
      await dbSaveSettings(user.id, {
        selectedDayId: overrides.selectedDayId,
        settings: settingsBlob,
      });
    });
  }, [user, queueDbWrite]);

  useEffect(() => {
    if (!user) {
      if (activeUserIdRef.current) {
        activeUserIdRef.current = null;
        supabaseSynced.current = false;
        setTasks({});
        setDays({});
        setMilestones({});
        setChecklists({});
        setPractice({});
        setRevision({});
        setNotes({});
        setStreaks({ current: 0, longest: 0, lastStudyDate: null });
        setSelectedDayId('day-001');
      }
      return;
    }

    if (user.id === activeUserIdRef.current && supabaseSynced.current) return;
    activeUserIdRef.current = user.id;
    supabaseSynced.current = true;

    (async () => {
      try {
        const [dbProgress, dbSettings] = await Promise.all([
          dbLoadProgress(user.id),
          dbLoadSettings(user.id),
        ]);

        const hasDbData = Object.keys(dbProgress.tasks).length > 0 || dbSettings !== null;
        const localTasks = loadFromStorage(STORAGE_KEYS.tasks, {});
        const hasLocalData = Object.keys(localTasks).length > 0;

        if (hasDbData) {
          // DB has data → load it (DB is source of truth)
          if (Object.keys(dbProgress.tasks).length > 0) {
            setTasks(dbProgress.tasks);
            saveToStorage(STORAGE_KEYS.tasks, dbProgress.tasks);
            setDays(dbProgress.days);
            saveToStorage(STORAGE_KEYS.days, dbProgress.days);
          }
          if (dbSettings?.settings) {
            const s = dbSettings.settings;
            if (s.milestones) { setMilestones(s.milestones); saveToStorage(STORAGE_KEYS.milestones, s.milestones); }
            if (s.checklists) { setChecklists(s.checklists); saveToStorage(STORAGE_KEYS.checklists, s.checklists); }
            if (s.practice) { setPractice(s.practice); saveToStorage(STORAGE_KEYS.practice, s.practice); }
            if (s.revision) { setRevision(s.revision); saveToStorage(STORAGE_KEYS.revision, s.revision); }
            if (s.notes) { setNotes(s.notes); saveToStorage(STORAGE_KEYS.notes, s.notes); }
            if (s.streaks) { setStreaks(s.streaks); saveToStorage(STORAGE_KEYS.streaks, s.streaks); }
            if (s.learningLevel) {
              setLearningLevelState(s.learningLevel);
              saveToStorage(STORAGE_KEYS.settings, { learningLevel: s.learningLevel });
            }
          }
          if (dbSettings?.selected_day_id) {
            setSelectedDayId(dbSettings.selected_day_id);
          }
        } else if (hasLocalData) {
          // No DB data but localStorage has data → migrate to Supabase
          const entries = [];
          for (const [taskId, completed] of Object.entries(localTasks)) {
            const dayId = taskToDayMap[taskId];
            if (dayId) entries.push({ taskId, dayId, completed: !!completed });
          }
          if (entries.length > 0) {
            await dbSaveTaskBatch(user.id, entries);
          }
          syncSettingsToDb();
        }
      } catch (err) {
        console.warn('[CareerCompass] Supabase initial sync failed, using localStorage:', err.message);
      }
    })();
  }, [user, syncSettingsToDb]);

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

      // Sync to Supabase
      if (user) {
        queueDbWrite(() => dbSaveTask(user.id, taskId, dayId, nextDone));
      }

      // Check if all active tasks in day are now complete
      const dayObj = roadmap.find(d => d.id === dayId);
      if (dayObj && dayObj.tasks && dayObj.tasks.length > 0) {
        updateDays(prevDays => {
          const isAiUnlocked = checkIsAiTrackUnlocked(prevDays);
          const activeTasks = dayObj.tasks.filter(t => isAiUnlocked || !isAiPythonTask(t));
          const allDone = activeTasks.length > 0 && activeTasks.every(t => (t.id === taskId ? next[taskId] : next[t.id]));
          const nextDays = { ...prevDays, [dayId]: allDone };
          if (allDone && !prevDays[dayId]) {
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
  }, [updateTasks, updateDays, recordDayStudy, showToast, user, queueDbWrite]);

  // Toggle day completion explicitly
  const toggleDay = useCallback((dayId) => {
    updateDays(prev => {
      const nextStatus = !prev[dayId];
      const next = { ...prev, [dayId]: nextStatus };
      if (nextStatus) {
        // Also mark active tasks of this day completed
        const dayObj = roadmap.find(d => d.id === dayId);
        if (dayObj?.tasks) {
          const isAiUnlocked = checkIsAiTrackUnlocked(prev);
          const activeTasks = dayObj.tasks.filter(t => isAiUnlocked || !isAiPythonTask(t));
          updateTasks(prevTasks => {
            const nextTasks = { ...prevTasks };
            activeTasks.forEach(t => { nextTasks[t.id] = true; });
            return nextTasks;
          });
          // Sync active tasks for this day to Supabase
          if (user && activeTasks.length > 0) {
            const entries = activeTasks.map(t => ({ taskId: t.id, dayId, completed: true }));
            queueDbWrite(() => dbSaveTaskBatch(user.id, entries));
          }
        }
        recordDayStudy(dayId);
        showToast('DAY COMPLETE', 'day');
      }
      return next;
    });
  }, [updateDays, updateTasks, recordDayStudy, showToast, user, queueDbWrite]);

  // Toggle project milestone
  const toggleMilestone = useCallback((milestoneId) => {
    let isCompleted = false;
    updateMilestones(prev => {
      isCompleted = !prev[milestoneId];
      const next = { ...prev, [milestoneId]: isCompleted };
      if (user) syncSettingsToDb({ milestones: next });
      return next;
    });
    if (isCompleted) {
      showToast('PROJECT MILESTONE COMPLETE', 'milestone');
    }
  }, [updateMilestones, showToast, user, syncSettingsToDb]);

  // Toggle project checklist item
  const toggleChecklist = useCallback((checklistKey) => {
    updateChecklists(prev => {
      const next = { ...prev, [checklistKey]: !prev[checklistKey] };
      if (user) syncSettingsToDb({ checklists: next });
      return next;
    });
  }, [updateChecklists, user, syncSettingsToDb]);

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

      const next = {
        ...prev,
        [practiceId]: {
          status: nextStatus,
          timesPracticed: nextStatus ? currentTimes + 1 : currentTimes,
          lastPracticed: nextStatus ? today : (cur?.lastPracticed || today),
        },
      };
      if (user) syncSettingsToDb({ practice: next });
      return next;
    });

    if (isMarked) {
      showToast('Practice recorded ✓', 'practice');
    }
  }, [updatePractice, showToast, user, syncSettingsToDb]);

  // Mark revision status (needs_revision, in_progress, completed)
  const setTopicRevisionStatus = useCallback((topicId, status) => {
    updateRevision(prev => {
      const next = {
        ...prev,
        [topicId]: { status, lastUpdated: todayISO() },
      };
      if (user) syncSettingsToDb({ revision: next });
      return next;
    });
  }, [updateRevision, user, syncSettingsToDb]);

  // Save note for a day
  const setDayNote = useCallback((dayId, text) => {
    updateNotes(prev => {
      const next = { ...prev, [dayId]: text };
      if (user) syncSettingsToDb({ notes: next });
      return next;
    });
  }, [updateNotes, user, syncSettingsToDb]);

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
      aptitude: { total: 0, completed: 0 },
      career: { total: 0, completed: 0 },
      genai: { total: 0, completed: 0 },
      sem5: { total: 0, completed: 0 },
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

    // Determine current day (first uncompleted day)
    const firstIncompleteDay = roadmap.find(d => !days[d.id]);
    const currentDay = firstIncompleteDay || roadmap[0];
    const currentPhase = phases.find(p => p.id === currentDay.phase) || phases[0];

    // Progression gating for AI & PythonCompanion Track (Requirement L):
    // Phase 1: Web Development (Days 1–52)
    // Phase 2: Cloud + Docker (Days 53–72)
    // Phase 3: AI / Python track activates only AFTER Phase 1 & Phase 2 are complete.
    const webDevDays = roadmap.filter(d => d.day >= 1 && d.day <= 52);
    const webDevCompletedDays = webDevDays.filter(d => !!days[d.id]).length;
    const isWebDevDone = webDevDays.length > 0 && webDevCompletedDays === webDevDays.length;

    const cloudDockerDays = roadmap.filter(d => d.day >= 53 && d.day <= 72);
    const cloudDockerCompletedDays = cloudDockerDays.filter(d => !!days[d.id]).length;
    const isCloudDockerDone = cloudDockerDays.length > 0 && cloudDockerCompletedDays === cloudDockerDays.length;

    const isAiTrackUnlocked = isWebDevDone && isCloudDockerDone;

    const aiTrackStatus = {
      isUnlocked: isAiTrackUnlocked,
      isWebDevDone,
      isCloudDockerDone,
      webDevProgress: { completed: webDevCompletedDays, total: webDevDays.length },
      cloudDockerProgress: { completed: cloudDockerCompletedDays, total: cloudDockerDays.length },
    };

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
      aiTrackStatus,
    };
  }, [tasks, days, milestones, practice]);

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

    // 1. Main Track (Sheryians KODEX): HTML/CSS excluded for known learners; exclude locked AI/Python tasks
    const mainTasks = day.tasks.filter(t => {
      if (isAiPythonTask(t)) return false;
      const top = topics.find(tp => tp.id === t.topicId);
      return (!top || top.track === 'main') && !['topic-html', 'topic-css'].includes(t.topicId);
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

    // 2. DSA with C++ (Page Source)
    const dsaTasks = day.tasks.filter(t => {
      const top = topics.find(tp => tp.id === t.topicId);
      return top?.track === 'cpp-dsa' || t.topicId.includes('dsa') || t.topicId.includes('cpp');
    });
    if (dsaTasks.length > 0 || day.schedule?.dsa) {
      sections.push({
        id: 'dsa',
        label: 'DSA with C++',
        badge: 'Page Source',
        color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
        focus: day.schedule?.dsa?.focus || dsaTasks[0]?.title || 'Algorithm Problem Solving',
        tasks: dsaTasks,
      });
    }

    // 3. Aptitude (Sheryians KODEX) - strictly independent track from Core CS
    const aptitudeTasks = day.tasks.filter(t => {
      const top = topics.find(tp => tp.id === t.topicId);
      return top?.track === 'aptitude' || t.topicId === 'topic-aptitude' || t.topicId.startsWith('topic-aptitude');
    });
    const isAptitudeScheduled = day.schedule?.aptitude || day.schedule?.coreCS?.topic === 'topic-aptitude';
    if (aptitudeTasks.length > 0 || isAptitudeScheduled) {
      sections.push({
        id: 'aptitude',
        label: 'Aptitude',
        badge: 'KODEX Aptitude',
        color: 'border-violet-500/30 text-violet-400 bg-violet-500/10',
        focus: day.schedule?.aptitude?.focus || (day.schedule?.coreCS?.topic === 'topic-aptitude' ? day.schedule.coreCS.focus : null) || aptitudeTasks[0]?.title || 'Quantitative & Logical Reasoning',
        tasks: aptitudeTasks,
      });
    }

    // 4. Core CS (Page Source) - strictly follows: SQL -> OOP -> DBMS -> OS -> CN -> System Design
    const CORE_CS_ORDER = [
      'topic-sql',
      'topic-oop',
      'topic-dbms',
      'topic-os',
      'topic-cn',
      'topic-system-design',
    ];
    const isCoreCsTopic = (topicId = '') =>
      CORE_CS_ORDER.some(id => topicId === id || topicId.startsWith(`${id}-`));

    const coreTasks = day.tasks
      .filter(t => {
        if (isAiPythonTask(t)) return false;
        const top = topics.find(tp => tp.id === t.topicId);
        return top?.track === 'core-cs' || isCoreCsTopic(t.topicId);
      })
      .sort((a, b) => {
        const aIdx = CORE_CS_ORDER.findIndex(id => a.topicId.startsWith(id));
        const bIdx = CORE_CS_ORDER.findIndex(id => b.topicId.startsWith(id));
        return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
      });

    const hasCoreCsSchedule = day.schedule?.coreCS && day.schedule.coreCS.topic !== 'topic-aptitude' && !isAiPythonTopicId(day.schedule.coreCS.topic);
    if (coreTasks.length > 0 || hasCoreCsSchedule || day.day === 1) {
      sections.push({
        id: 'core-cs',
        label: 'Core CS',
        badge: 'Page Source',
        color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
        focus: hasCoreCsSchedule
          ? day.schedule.coreCS.focus
          : (coreTasks[0]?.title || 'Core CS: SQL → OOP → DBMS → OS → CN → System Design (Begins Day 6)'),
        tasks: coreTasks,
      });
    }

    // 5. Python Track — only visible when AI track is unlocked
    const pythonTasks = day.tasks.filter(t => {
      const top = topics.find(tp => tp.id === t.topicId);
      return top?.track === 'python' || t.topicId.includes('python');
    });
    if (stats.aiTrackStatus.isUnlocked && (pythonTasks.length > 0 || day.schedule?.sideTrack)) {
      sections.push({
        id: 'python',
        label: 'Python Track',
        badge: 'Python & AI',
        color: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
        focus: day.schedule?.sideTrack?.focus || pythonTasks[0]?.title || 'Python Companion Practice',
        tasks: pythonTasks,
      });
    }

    // 6. AI Track — only visible when AI track is unlocked
    const aiTasks = day.tasks.filter(t => {
      const top = topics.find(tp => tp.id === t.topicId);
      return top?.track === 'genai' || t.topicId.includes('genai') || t.topicId.includes('ai-engineering') || t.topicId.includes('gnn');
    });
    if (stats.aiTrackStatus.isUnlocked && (aiTasks.length > 0 || day.schedule?.aiTrack)) {
      sections.push({
        id: 'genai',
        label: 'AI Track',
        badge: 'LLMs & AI',
        color: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
        focus: day.schedule?.aiTrack?.focus || aiTasks[0]?.title || 'AI & GenAI Focus',
        tasks: aiTasks,
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

    const isAiUnlocked = !!stats.aiTrackStatus?.isUnlocked;
    const activeTasks = day.tasks.filter(t => isAiUnlocked || !isAiPythonTask(t));
    const completedActiveTasks = activeTasks.filter(t => !!tasks[t.id]);

    // Practice Arcade (if scheduled or matching today's active tracks)
    const matchingPractice = practiceResources.find(r => {
      if (day.practice?.resourceId && r.id === day.practice.resourceId) return true;
      return activeTasks.some(t => {
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
      activeTasks,
      activeTaskCount: activeTasks.length,
      completedTaskCount: completedActiveTasks.length,
      completionPercent: activeTasks.length > 0 ? Math.round((completedActiveTasks.length / activeTasks.length) * 100) : 0,
    };
  }, [stats.currentDay, stats.aiTrackStatus, tasks]);

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
    const targetPath = tab === 'dashboard' ? '/dashboard' : `/${tab}`;
    navigate(targetPath);
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
    aiTrackStatus: stats.aiTrackStatus,
    todayMission,
    isAiPythonTask,
    isAiPythonTopicId,
    filterObjectivesForAiGate,

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

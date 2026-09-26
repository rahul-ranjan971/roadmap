import { useMemo } from 'react';
import { getOverallProgress, getTrackProgress, getPhaseProgress, getDashboardStats } from '../utils/progressCalc';

/**
 * Hook to compute all progress metrics from persisted state.
 * Memoized — recalculates only when dependencies change.
 */
export function useProgress(topics, completedTasks, daysData, projects, completedMilestones, phases) {
  const overall = useMemo(
    () => getOverallProgress(topics, completedTasks),
    [topics, completedTasks]
  );

  const trackProgress = useMemo(() => ({
    main: getTrackProgress(topics, 'main', completedTasks),
    python: getTrackProgress(topics, 'python', completedTasks),
    'cpp-dsa': getTrackProgress(topics, 'cpp-dsa', completedTasks),
    'core-cs': getTrackProgress(topics, 'core-cs', completedTasks),
  }), [topics, completedTasks]);

  const phaseProgress = useMemo(() => {
    const result = {};
    for (const phase of phases) {
      result[phase.id] = getPhaseProgress(topics, phase.id, completedTasks);
    }
    return result;
  }, [topics, completedTasks, phases]);

  const dashboard = useMemo(
    () => getDashboardStats(topics, completedTasks, daysData, projects, completedMilestones),
    [topics, completedTasks, daysData, projects, completedMilestones]
  );

  return { overall, trackProgress, phaseProgress, dashboard };
}

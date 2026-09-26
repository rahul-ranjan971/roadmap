// Progress calculation utilities

// Calculate percentage (safe division)
export function percent(completed, total) {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// Get phase for a given study day
export function getPhaseForDay(phases, studyDay) {
  return phases.find(p => studyDay >= p.startDay && studyDay <= p.endDay) || phases[0];
}

// Count completed subtopics for a topic
export function getTopicProgress(topicId, completedTasks = {}) {
  const tasks = completedTasks[topicId] || [];
  return tasks.length;
}

// Calculate overall roadmap progress
export function getOverallProgress(topics, completedTasks = {}) {
  let totalSubtopics = 0;
  let completedCount = 0;

  for (const topic of topics) {
    totalSubtopics += topic.subtopics.length;
    const done = completedTasks[topic.id] || [];
    completedCount += done.length;
  }

  return {
    completed: completedCount,
    total: totalSubtopics,
    percent: percent(completedCount, totalSubtopics),
  };
}

// Calculate track progress (main, python, cpp-dsa, core-cs)
export function getTrackProgress(topics, track, completedTasks = {}) {
  const trackTopics = topics.filter(t => t.track === track);
  return getOverallProgress(trackTopics, completedTasks);
}

// Calculate phase progress
export function getPhaseProgress(topics, phaseId, completedTasks = {}) {
  const phaseTopics = topics.filter(t => t.phase === phaseId);
  return getOverallProgress(phaseTopics, completedTasks);
}

// Calculate project progress
export function getProjectProgress(project, completedMilestones = {}) {
  const milestones = project.milestones || [];
  const done = completedMilestones[project.id] || [];
  return {
    completed: done.length,
    total: milestones.length,
    percent: percent(done.length, milestones.length),
  };
}

// Calculate streak
export function calculateStreak(daysData = {}) {
  const dates = Object.keys(daysData)
    .filter(k => daysData[k]?.completed)
    .sort()
    .reverse();

  if (dates.length === 0) return { current: 0, longest: 0 };

  let current = 1;
  let longest = 1;
  let streak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (prev - curr) / (1000 * 60 * 60 * 24);

    // Skip Sundays in streak calculation
    if (diff <= 2) {
      streak++;
      longest = Math.max(longest, streak);
    } else {
      if (i === 1) current = streak;
      streak = 1;
    }
  }

  if (dates.length === 1) current = 1;
  longest = Math.max(longest, streak);

  return { current, longest };
}

// Get completion stats for dashboard
export function getDashboardStats(topics, completedTasks, daysData, projects, completedMilestones) {
  const overall = getOverallProgress(topics, completedTasks);
  const streaks = calculateStreak(daysData);
  const completedDays = Object.values(daysData || {}).filter(d => d?.completed).length;

  let projectsDone = 0;
  for (const p of projects) {
    const prog = getProjectProgress(p, completedMilestones);
    if (prog.percent === 100) projectsDone++;
  }

  return {
    overall,
    streaks,
    completedDays,
    totalDays: 120,
    projectsCompleted: projectsDone,
    totalProjects: projects.length,
  };
}

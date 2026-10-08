/**
 * Roadmap data validation.
 * Verifies structural integrity of all data files.
 * Run via: node src/utils/validate.js (or import in tests)
 */

export function validateRoadmap(roadmap, phases, topics, projects, careers, practiceResources, quotes, bufferDays) {
  const errors = [];
  const warnings = [];

  // --- PHASES ---
  if (!phases || phases.length !== 11) {
    errors.push(`Expected 11 phases, got ${phases?.length || 0}`);
  }

  const phaseIds = new Set(phases.map(p => p.id));

  // --- ROADMAP (120 days) ---
  if (!roadmap || roadmap.length !== 120) {
    errors.push(`Expected 120 study days, got ${roadmap?.length || 0}`);
  }

  const dayIds = new Set();
  const taskIds = new Set();
  let sundayTasks = 0;

  for (const day of (roadmap || [])) {
    // No duplicate day IDs
    if (dayIds.has(day.id)) errors.push(`Duplicate day ID: ${day.id}`);
    dayIds.add(day.id);

    // Every day has a phase
    if (!phaseIds.has(day.phase)) {
      errors.push(`Day ${day.id} references unknown phase: ${day.phase}`);
    }

    // Every day has tasks
    if (!day.tasks || day.tasks.length === 0) {
      warnings.push(`Day ${day.id} has no tasks`);
    }

    // No duplicate task IDs
    for (const task of (day.tasks || [])) {
      if (taskIds.has(task.id)) errors.push(`Duplicate task ID: ${task.id}`);
      taskIds.add(task.id);
    }

    // Rest days should have no mandatory tasks
    if (day.isRestDay && day.tasks?.length > 0) {
      sundayTasks++;
    }
  }

  if (sundayTasks > 0) {
    errors.push(`${sundayTasks} rest days have mandatory tasks`);
  }

  // --- TOPICS ---
  const topicIds = new Set((topics || []).map(t => t.id));
  const mandatoryTopics = [
    'topic-html', 'topic-css', 'topic-javascript', 'topic-react', 'topic-nextjs',
    'topic-threejs', 'topic-gnn',
    'topic-nodejs', 'topic-expressjs', 'topic-mongodb', 'topic-mern',
    'topic-python-fundamentals', 'topic-python-data', 'topic-python-ai',
    'topic-cpp', 'topic-dsa',
    'topic-aptitude', 'topic-oop', 'topic-sql', 'topic-dbms',
    'topic-os', 'topic-cn', 'topic-system-design',
    'topic-devops', 'topic-cloud',
    'topic-data-analytics', 'topic-data-engineering',
    'topic-genai', 'topic-ai-engineering',
    'topic-resume', 'topic-communication', 'topic-interview-prep',
    'topic-sem5-dca3108', 'topic-sem5-dca3105', 'topic-sem5-dca3107',
    'topic-sem5-dca31e1', 'topic-sem5-dca3106',
  ];

  for (const id of mandatoryTopics) {
    if (!topicIds.has(id)) {
      errors.push(`Missing mandatory topic: ${id}`);
    }
  }

  // Check subtopics exist
  for (const topic of (topics || [])) {
    if (!topic.subtopics || topic.subtopics.length === 0) {
      errors.push(`Topic ${topic.id} has no subtopics`);
    }
    // Check subtopic IDs unique within topic
    const subIds = new Set();
    for (const sub of (topic.subtopics || [])) {
      if (subIds.has(sub.id)) errors.push(`Duplicate subtopic ID: ${sub.id} in ${topic.id}`);
      subIds.add(sub.id);
    }
  }

  // --- PROJECTS ---
  if (!projects || projects.length !== 13) {
    errors.push(`Expected 13 projects, got ${projects?.length || 0}`);
  }

  const projectIds = new Set();
  for (const p of (projects || [])) {
    if (projectIds.has(p.id)) errors.push(`Duplicate project ID: ${p.id}`);
    projectIds.add(p.id);

    if (!p.milestones || p.milestones.length === 0) {
      errors.push(`Project ${p.id} has no milestones`);
    }

    // Check milestone IDs unique
    const mIds = new Set();
    for (const m of (p.milestones || [])) {
      if (mIds.has(m.id)) errors.push(`Duplicate milestone ID: ${m.id} in ${p.id}`);
      mIds.add(m.id);
    }
  }

  // --- CAREERS ---
  if (!careers || careers.length !== 12) {
    errors.push(`Expected 12 careers, got ${careers?.length || 0}`);
  }

  const careerIds = new Set();
  for (const c of (careers || [])) {
    if (careerIds.has(c.id)) errors.push(`Duplicate career ID: ${c.id}`);
    careerIds.add(c.id);

    // Check referenced skills exist
    for (const skillId of (c.requiredSkills || [])) {
      if (!topicIds.has(skillId)) {
        warnings.push(`Career ${c.id} references unknown skill: ${skillId}`);
      }
    }
  }

  // --- PRACTICE RESOURCES ---
  for (const r of (practiceResources || [])) {
    if (r.verified && !r.url) {
      errors.push(`Practice resource ${r.id} marked verified but has no URL`);
    }
  }

  // --- QUOTES ---
  if (!quotes || quotes.length < 120) {
    errors.push(`Expected ≥120 quotes, got ${quotes?.length || 0}`);
  }

  // --- SYSTEM DESIGN check ---
  const sdTopic = (topics || []).find(t => t.id === 'topic-system-design');
  if (!sdTopic) {
    errors.push('System Design topic MISSING');
  } else {
    const requiredSD = ['HLD', 'LLD', 'CAP theorem', 'load balancing', 'caching', 'sharding'];
    for (const req of requiredSD) {
      const found = sdTopic.subtopics.some(s =>
        s.title.toLowerCase().includes(req.toLowerCase())
      );
      if (!found) warnings.push(`System Design missing subtopic: ${req}`);
    }
  }

  // --- GNN check ---
  if (!topicIds.has('topic-gnn')) {
    errors.push('GNN topic MISSING — must remain visible');
  }

  // --- Three.js check ---
  if (!topicIds.has('topic-threejs')) {
    errors.push('Three.js topic MISSING');
  }

  // --- BUFFER DAYS (15 buffer days, zero scheduled study hours) ---
  if (bufferDays) {
    if (bufferDays.length !== 15) {
      errors.push(`Expected 15 buffer days, got ${bufferDays.length}`);
    }
    const nonZeroHours = bufferDays.filter((b) => b.scheduledStudyHours !== 0);
    if (nonZeroHours.length > 0) {
      errors.push(`${nonZeroHours.length} buffer days have non-zero scheduled study hours`);
    }
  }

  // Compute stats
  const totalSubtopics = (topics || []).reduce((sum, t) => sum + (t.subtopics?.length || 0), 0);
  const totalTasks = (roadmap || []).reduce((sum, d) => sum + (d.tasks?.length || 0), 0);
  const totalMilestones = (projects || []).reduce((sum, p) => sum + (p.milestones?.length || 0), 0);
  const verifiedResources = (practiceResources || []).filter(r => r.verified).length;
  const weeks = new Set((roadmap || []).map(d => d.week)).size;

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      phases: phases?.length || 0,
      weeks,
      studyDays: roadmap?.length || 0,
      bufferDays: bufferDays?.length || 0,
      totalCalendarDays: (roadmap?.length || 0) + (bufferDays?.length || 0),
      sundayRestDays: weeks, // one per week
      topics: topics?.length || 0,
      subtopics: totalSubtopics,
      tasks: totalTasks,
      projects: projects?.length || 0,
      milestones: totalMilestones,
      careers: careers?.length || 0,
      practiceResources: practiceResources?.length || 0,
      verifiedResources,
      quotes: quotes?.length || 0,
    },
  };
}

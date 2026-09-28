export const HTML_CSS_DAY_IDS = [];

export function getActiveGlobalDayNumber(day) {
  if (!day) return 1;
  return Number(day.day ?? 1);
}

export function getActiveRoadmapDays(roadmap) {
  return roadmap;
}

export function getActiveRoadmapDayNumber(roadmap, dayId) {
  const index = roadmap.findIndex((day) => day.id === dayId);
  return index >= 0 ? index + 1 : null;
}

export function getActiveRoadmapDayById(roadmap, dayId) {
  return roadmap.find((day) => day.id === dayId) || null;
}

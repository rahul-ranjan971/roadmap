// Date utilities for 120-day roadmap
// Sunday = 0 in JS Date.getDay()

export function isSunday(date) {
  return new Date(date).getDay() === 0;
}

// Get deterministic quote index for a date (same date = same quote)
export function getQuoteIndexForDate(date, totalQuotes = 120) {
  const d = new Date(date);
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return seed % totalQuotes;
}

// Calculate current study day from start date (skipping Sundays)
export function getStudyDay(startDate, currentDate = new Date()) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const current = new Date(currentDate);
  current.setHours(0, 0, 0, 0);

  let studyDays = 0;
  const d = new Date(start);

  while (d <= current) {
    if (d.getDay() !== 0) studyDays++;
    d.setDate(d.getDate() + 1);
  }

  return Math.min(studyDays, 120);
}

// Get calendar date for a specific study day (skipping Sundays)
export function getDateForStudyDay(startDate, studyDay) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  let count = 0;
  const d = new Date(start);

  while (count < studyDay) {
    if (d.getDay() !== 0) count++;
    if (count < studyDay) d.setDate(d.getDate() + 1);
  }

  return d;
}

// Format date for display
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// Get day of week name
export function getDayName(date) {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
}

// Check if two dates are the same calendar day
export function isSameDay(d1, d2) {
  const a = new Date(d1);
  const b = new Date(d2);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Get today's ISO date string (YYYY-MM-DD)
export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

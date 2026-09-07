/** Formats a yyyy-MM-dd date-only string (e.g. "2026-05-23") as "May 23, 2026", avoiding local timezone shift. */
export function formatDueDate(dueDate: string): string {
  const [year, month, day] = dueDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

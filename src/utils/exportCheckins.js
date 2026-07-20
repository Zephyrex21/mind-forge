/**
 * Converts a list of check-ins into a CSV file and triggers a browser
 * download — lets people keep/back up their own journal data outside the
 * app in a format any spreadsheet tool can open.
 */
import { downloadFile } from './clipboard';

const CSV_COLUMNS = [
  { key: 'createdAt', label: 'Date', format: (v) => (v ? new Date(v).toLocaleString() : '') },
  { key: 'mood', label: 'Mood (1-5)' },
  { key: 'energy', label: 'Energy (1-5)' },
  { key: 'sleepHours', label: 'Sleep Hours' },
  { key: 'sleepQuality', label: 'Sleep Quality (1-5)' },
  { key: 'currentFocus', label: 'Current Focus' },
  { key: 'intention', label: 'Intention' },
  { key: 'copingTools', label: 'Coping Tools', format: (v) => (Array.isArray(v) ? v.join('; ') : '') },
  { key: 'copingNotes', label: 'Coping Notes' },
  { key: 'goals', label: 'Goals' },
  { key: 'milestones', label: 'Milestones' },
  { key: 'gratitude', label: 'Gratitude' },
  { key: 'customNotes', label: 'Custom Notes' },
  { key: 'aiReflection', label: 'AI Reflection' },
  { key: 'isFavorite', label: 'Favorite', format: (v) => (v ? 'Yes' : 'No') },
];

/** Escapes a single CSV field: wraps in quotes and doubles any inner quotes
 * whenever the value contains a comma, quote, or newline (the standard
 * CSV-escaping rule) — without this, any journal entry containing a comma
 * or line break would silently corrupt the column structure. */
function escapeCsvField(value) {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function checkinsToCsv(checkins) {
  const header = CSV_COLUMNS.map((col) => escapeCsvField(col.label)).join(',');
  const rows = checkins.map((checkin) =>
    CSV_COLUMNS.map((col) => {
      const raw = checkin[col.key];
      const value = col.format ? col.format(raw) : raw;
      return escapeCsvField(value);
    }).join(',')
  );
  // Leading BOM so Excel opens the file as UTF-8 instead of guessing wrong
  // and mangling non-ASCII characters in journal text.
  return `\uFEFF${[header, ...rows].join('\r\n')}`;
}

export function exportCheckinsToCsv(checkins, filename = 'mindforge-checkins.csv') {
  const csv = checkinsToCsv(checkins);
  downloadFile(csv, filename, 'text/csv;charset=utf-8');
}

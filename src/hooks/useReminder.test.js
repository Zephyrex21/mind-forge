import { describe, it, expect, beforeEach } from 'vitest';
import { loadReminderPrefs, saveReminderPrefs, hasReminderTimePassed } from './useReminder';

describe('loadReminderPrefs / saveReminderPrefs', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns disabled defaults when nothing is stored', () => {
    expect(loadReminderPrefs()).toEqual({ enabled: false, time: '20:00' });
  });

  it('round-trips a saved preference', () => {
    saveReminderPrefs({ enabled: true, time: '09:30' });
    expect(loadReminderPrefs()).toEqual({ enabled: true, time: '09:30' });
  });

  it('falls back to defaults when stored JSON is corrupted', () => {
    localStorage.setItem('mindforge:reminder', '{not valid json');
    expect(loadReminderPrefs()).toEqual({ enabled: false, time: '20:00' });
  });

  it('falls back to the default time when the stored time is malformed', () => {
    localStorage.setItem('mindforge:reminder', JSON.stringify({ enabled: true, time: 'not-a-time' }));
    expect(loadReminderPrefs()).toEqual({ enabled: true, time: '20:00' });
  });

  it('coerces a non-boolean enabled value to a real boolean', () => {
    localStorage.setItem('mindforge:reminder', JSON.stringify({ enabled: 'yes', time: '08:00' }));
    expect(loadReminderPrefs()).toEqual({ enabled: true, time: '08:00' });
  });
});

describe('hasReminderTimePassed', () => {
  it('is false before the reminder time today', () => {
    const now = new Date(2026, 6, 20, 19, 0); // 7:00 PM
    expect(hasReminderTimePassed('20:00', now)).toBe(false);
  });

  it('is true exactly at the reminder time', () => {
    const now = new Date(2026, 6, 20, 20, 0);
    expect(hasReminderTimePassed('20:00', now)).toBe(true);
  });

  it('is true after the reminder time today', () => {
    const now = new Date(2026, 6, 20, 22, 15);
    expect(hasReminderTimePassed('20:00', now)).toBe(true);
  });
});

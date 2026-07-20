import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'mindforge:reminder';
const DEFAULT_PREFS = { enabled: false, time: '20:00' };

/**
 * Reminders are stored purely client-side (localStorage) rather than on
 * the User model — this is a single-device convenience preference, not
 * account data that needs to sync across devices, so it doesn't need a
 * backend round trip.
 */
export function loadReminderPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw);
    return {
      enabled: !!parsed.enabled,
      time: typeof parsed.time === 'string' && /^\d{2}:\d{2}$/.test(parsed.time) ? parsed.time : DEFAULT_PREFS.time,
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function saveReminderPrefs(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage can throw (private browsing, storage full, disabled).
    // Reminders are a nice-to-have — fail silently rather than crash.
  }
}

/** True once the clock has reached or passed `time` ('HH:MM', 24h, local)
 * on `now`'s calendar day. */
export function hasReminderTimePassed(time, now = new Date()) {
  const [h, m] = time.split(':').map(Number);
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  return now.getTime() >= target.getTime();
}

/**
 * Manages the reminder preference and, when enabled + permitted, schedules
 * a browser Notification for the chosen time each day.
 *
 * Important limitation: without a service worker (deliberately out of
 * scope here), this can only fire while the tab/window stays open — it's
 * a best-effort nudge, not a reliable background push notification. The
 * in-app "haven't checked in yet" banner (driven by hasReminderTimePassed)
 * is the part of this feature that works regardless of whether a browser
 * notification was ever shown.
 */
export function useReminder() {
  const [prefs, setPrefs] = useState(loadReminderPrefs);
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  useEffect(() => {
    saveReminderPrefs(prefs);
  }, [prefs]);

  useEffect(() => {
    if (!prefs.enabled || typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      return undefined;
    }

    let timeoutId;
    const scheduleNext = () => {
      const [h, m] = prefs.time.split(':').map(Number);
      const target = new Date();
      target.setHours(h, m, 0, 0);
      if (target.getTime() <= Date.now()) {
        target.setDate(target.getDate() + 1);
      }
      const delay = target.getTime() - Date.now();
      timeoutId = setTimeout(() => {
        try {
          new Notification('Time for your MindForge check-in', {
            body: "Take a minute to log how you're doing today.",
          });
        } catch {
          // Notification construction can throw in some browsers/contexts
          // (e.g. permission revoked mid-session) — not worth surfacing.
        }
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [prefs.enabled, prefs.time]);

  const setEnabled = useCallback((enabled) => setPrefs((p) => ({ ...p, enabled })), []);
  const setTime = useCallback((time) => setPrefs((p) => ({ ...p, time })), []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'unsupported';
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const sendTestNotification = useCallback(() => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return false;
    new Notification('MindForge reminder test', { body: 'This is what your daily nudge will look like.' });
    return true;
  }, []);

  return { ...prefs, permission, setEnabled, setTime, requestPermission, sendTestNotification };
}

export default useReminder;

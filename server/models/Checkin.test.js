import { describe, it, expect } from 'vitest';
import { dayKey, encodeCursor, decodeCursor } from './Checkin.js';

// IST = UTC+5:30, so JS's Date.getTimezoneOffset() convention gives -330
const IST_OFFSET = -330;

describe('dayKey (timezone-aware calendar-day bucketing)', () => {
  it('buckets a UTC timestamp to the correct local day for a positive-offset timezone', () => {
    // 19:00 UTC on July 4 = 00:30 IST on July 5 (just past local midnight)
    const key = dayKey('2026-07-04T19:00:00Z', IST_OFFSET);
    const asDate = new Date(key);
    expect(asDate.getUTCDate()).toBe(5);
    expect(asDate.getUTCMonth()).toBe(6); // July = month index 6
  });

  it('reproduces the exact bug scenario this was built to fix', () => {
    // A check-in at 23:00 UTC July 4 (04:30 IST July 5) and "now" at 15:00 UTC
    // July 5 (20:30 IST July 5) are the SAME calendar day in India, even
    // though they fall on different UTC calendar dates.
    const checkinUTC = '2026-07-04T23:00:00Z';
    const nowUTC = '2026-07-05T15:00:00Z';

    expect(checkinUTC.slice(0, 10)).not.toBe(nowUTC.slice(0, 10)); // different raw UTC days
    expect(dayKey(checkinUTC, IST_OFFSET)).toBe(dayKey(nowUTC, IST_OFFSET)); // same local day
  });

  it('with tzOffsetMinutes=0 (UTC/server time), the same two timestamps land on different days', () => {
    // Demonstrates the bug that existed before the fix: without timezone
    // awareness, these two same-local-day timestamps would incorrectly
    // be treated as different days, breaking a user's streak.
    const checkinUTC = '2026-07-04T23:00:00Z';
    const nowUTC = '2026-07-05T15:00:00Z';
    expect(dayKey(checkinUTC, 0)).not.toBe(dayKey(nowUTC, 0));
  });

  it('produces a timestamp truncated to midnight (no time-of-day component)', () => {
    const key = dayKey('2026-07-04T19:37:42Z', 0);
    const asDate = new Date(key);
    expect(asDate.getUTCHours()).toBe(0);
    expect(asDate.getUTCMinutes()).toBe(0);
    expect(asDate.getUTCSeconds()).toBe(0);
  });

  it('handles a negative-offset (behind UTC) timezone correctly', () => {
    // US Pacific-like offset: UTC-8 => getTimezoneOffset() returns +480
    const PST_OFFSET = 480;
    // 02:00 UTC on July 5 = 18:00 PST on July 4 (previous local day)
    const key = dayKey('2026-07-05T02:00:00Z', PST_OFFSET);
    const asDate = new Date(key);
    expect(asDate.getUTCDate()).toBe(4);
  });

  it('defaults to UTC (offset 0) when no offset is given', () => {
    const withDefault = dayKey('2026-07-04T12:00:00Z');
    const withExplicitZero = dayKey('2026-07-04T12:00:00Z', 0);
    expect(withDefault).toBe(withExplicitZero);
  });

  it('two timestamps on the same UTC calendar day with offset 0 match', () => {
    const morning = dayKey('2026-07-04T02:00:00Z', 0);
    const evening = dayKey('2026-07-04T22:00:00Z', 0);
    expect(morning).toBe(evening);
  });
});

describe('encodeCursor / decodeCursor (pagination)', () => {
  it('round-trips a cursor built from a document', () => {
    const doc = { createdAt: new Date('2026-07-20T10:00:00.000Z'), _id: '507f1f77bcf86cd799439011' };
    const cursor = encodeCursor(doc);
    const decoded = decodeCursor(cursor);

    expect(decoded.createdAt.toISOString()).toBe(doc.createdAt.toISOString());
    expect(decoded.id).toBe(doc._id);
  });

  it('produces a distinct cursor for two documents sharing the exact same createdAt', () => {
    // The whole point of the fix: createdAt alone isn't a safe cursor
    // when two check-ins share the same millisecond timestamp — the _id
    // is what keeps these two page-boundary cursors distinguishable.
    const sameTime = new Date('2026-07-20T10:00:00.000Z');
    const cursorA = encodeCursor({ createdAt: sameTime, _id: 'aaaaaaaaaaaaaaaaaaaaaaaa' });
    const cursorB = encodeCursor({ createdAt: sameTime, _id: 'bbbbbbbbbbbbbbbbbbbbbbbb' });

    expect(cursorA).not.toBe(cursorB);
    expect(decodeCursor(cursorA).id).not.toBe(decodeCursor(cursorB).id);
  });

  it('returns null for a garbage/corrupted cursor instead of throwing', () => {
    expect(decodeCursor('not-valid-base64-!!!')).toBeNull();
  });

  it('returns null for a well-formed base64 string that decodes to nonsense', () => {
    const nonsense = Buffer.from('just some random text', 'utf8').toString('base64');
    expect(decodeCursor(nonsense)).toBeNull();
  });

  it('returns null when the id half is missing', () => {
    const malformed = Buffer.from('2026-07-20T10:00:00.000Z|', 'utf8').toString('base64');
    expect(decodeCursor(malformed)).toBeNull();
  });
});

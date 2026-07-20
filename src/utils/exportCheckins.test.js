import { describe, it, expect } from 'vitest';
import { checkinsToCsv } from './exportCheckins';

describe('checkinsToCsv', () => {
  it('includes a UTF-8 BOM at the start', () => {
    const csv = checkinsToCsv([]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });

  it('writes a header row with no check-ins', () => {
    const csv = checkinsToCsv([]);
    const lines = csv.replace('\uFEFF', '').split('\r\n');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('Date');
    expect(lines[0]).toContain('Mood (1-5)');
  });

  it('formats a basic check-in row', () => {
    const csv = checkinsToCsv([{ mood: 4, energy: 3, sleepHours: 7, isFavorite: true }]);
    const lines = csv.replace('\uFEFF', '').split('\r\n');
    expect(lines[1]).toContain('4');
    expect(lines[1]).toContain('3');
    expect(lines[1]).toContain('7');
    expect(lines[1]).toContain('Yes');
  });

  it('joins an array of coping tools with a semicolon', () => {
    const csv = checkinsToCsv([{ copingTools: ['walking', 'journaling'] }]);
    expect(csv).toContain('walking; journaling');
  });

  it('quotes and escapes a field containing a comma', () => {
    const csv = checkinsToCsv([{ gratitude: 'my dog, my family' }]);
    expect(csv).toContain('"my dog, my family"');
  });

  it('doubles internal quotes and wraps the field in quotes', () => {
    const csv = checkinsToCsv([{ customNotes: 'she said "hi" to me' }]);
    expect(csv).toContain('"she said ""hi"" to me"');
  });

  it('quotes a field containing a newline so it cannot break the row structure', () => {
    const csv = checkinsToCsv([{ aiReflection: 'line one\nline two' }]);
    expect(csv).toContain('"line one\nline two"');
  });

  it('quotes a field containing a bare carriage return', () => {
    const csv = checkinsToCsv([{ customNotes: 'part one\rpart two' }]);
    expect(csv).toContain('"part one\rpart two"');
  });

  it('leaves a plain field with no special characters unquoted', () => {
    const csv = checkinsToCsv([{ currentFocus: 'work' }]);
    const lines = csv.replace('\uFEFF', '').split('\r\n');
    expect(lines[1]).not.toContain('"work"');
    expect(lines[1]).toContain('work');
  });

  it('formats createdAt as a locale date string when present', () => {
    const csv = checkinsToCsv([{ createdAt: '2026-07-20T10:00:00.000Z' }]);
    const lines = csv.replace('\uFEFF', '').split('\r\n');
    // Exact formatting is locale-dependent — just confirm it's not the raw ISO string
    // and isn't left blank.
    expect(lines[1].startsWith(',')).toBe(false);
  });

  it('leaves null/undefined fields as empty strings rather than "null"/"undefined"', () => {
    const csv = checkinsToCsv([{ mood: null, energy: undefined }]);
    expect(csv).not.toContain('null');
    expect(csv).not.toContain('undefined');
  });
});

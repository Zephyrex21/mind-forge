import { describe, it, expect } from 'vitest';
import { containsCrisisLanguage, CRISIS_RESOURCES } from './keywordCheck.js';

describe('containsCrisisLanguage', () => {
  it('flags direct statements of suicidal intent', () => {
    expect(containsCrisisLanguage('I want to end my life')).toBe(true);
    expect(containsCrisisLanguage('sometimes I think about killing myself')).toBe(true);
    expect(containsCrisisLanguage('I feel suicidal lately')).toBe(true);
  });

  it('flags self-harm language', () => {
    expect(containsCrisisLanguage('I keep hurting myself when things get bad')).toBe(true);
    expect(containsCrisisLanguage('thinking about self-harm again')).toBe(true);
  });

  it('flags hopelessness phrases when specific enough', () => {
    expect(containsCrisisLanguage("I can't go on anymore")).toBe(true);
    expect(containsCrisisLanguage("I can't go on like this")).toBe(true);
    expect(containsCrisisLanguage('there is no reason to live')).toBe(true);
  });

  it('does not flag ordinary, unrelated text', () => {
    expect(containsCrisisLanguage('I had a rough day but I am okay')).toBe(false);
    expect(containsCrisisLanguage('work has been stressful this week')).toBe(false);
    expect(containsCrisisLanguage('')).toBe(false);
  });

  it('does not false-positive on the narrowed "can\'t go on" pattern', () => {
    // This one was previously too broad and flagged innocuous phrasing.
    expect(containsCrisisLanguage("can't go on vacation this year")).toBe(false);
    expect(containsCrisisLanguage("can't go on a trip with them")).toBe(false);
  });

  it('scans every field passed in, not just the first', () => {
    expect(containsCrisisLanguage('', '', '', '', '', 'I want to end my life')).toBe(true);
    expect(containsCrisisLanguage(undefined, null, 'I keep hurting myself')).toBe(true);
  });

  it('handles undefined/null/empty fields without throwing', () => {
    expect(() => containsCrisisLanguage(undefined, null, '')).not.toThrow();
    expect(containsCrisisLanguage(undefined, null, '')).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(containsCrisisLanguage('I WANT TO END MY LIFE')).toBe(true);
  });
});

describe('CRISIS_RESOURCES', () => {
  it('contains exactly the verified Indian government helplines', () => {
    expect(CRISIS_RESOURCES).toHaveLength(3);
    expect(CRISIS_RESOURCES.some((r) => r.name.includes('Tele-MANAS'))).toBe(true);
    expect(CRISIS_RESOURCES.some((r) => r.name.includes('KIRAN'))).toBe(true);
    expect(CRISIS_RESOURCES.some((r) => r.contact.includes('112'))).toBe(true);
  });

  it('does not contain US-specific or private/NGO numbers', () => {
    const allText = JSON.stringify(CRISIS_RESOURCES);
    expect(allText).not.toContain('988');
    expect(allText).not.toContain('iCall');
  });

  it('every resource has the fields the UI depends on', () => {
    for (const resource of CRISIS_RESOURCES) {
      expect(resource).toHaveProperty('region');
      expect(resource).toHaveProperty('name');
      expect(resource).toHaveProperty('contact');
      expect(typeof resource.name).toBe('string');
      expect(resource.name.length).toBeGreaterThan(0);
    }
  });
});

import { describe, it, expect } from 'vitest';
import { buildOptimizedPrompt, SYSTEM_PROMPT } from './promptOptimizer.js';

describe('SYSTEM_PROMPT safety boundaries', () => {
  it('explicitly forbids diagnosis and clinical claims', () => {
    expect(SYSTEM_PROMPT).toMatch(/NOT a therapist/i);
    expect(SYSTEM_PROMPT).toMatch(/NEVER diagnose/i);
  });

  it('requires a "not a substitute for care" closing reminder', () => {
    expect(SYSTEM_PROMPT).toMatch(/not a substitute for professional/i);
  });

  it('has explicit instructions for the safety-flagged case', () => {
    expect(SYSTEM_PROMPT).toMatch(/SAFETY_FLAGGED/);
  });
});

describe('buildOptimizedPrompt', () => {
  it('includes provided fields in the prompt', () => {
    const { prompt } = buildOptimizedPrompt({
      currentFocus: 'a big work deadline',
      mood: 3,
      energy: 2,
    }, false);
    expect(prompt).toContain('a big work deadline');
    expect(prompt).toContain('MOOD');
    expect(prompt).toContain('3');
  });

  it('omits fields that were not provided (no placeholder junk)', () => {
    const { prompt } = buildOptimizedPrompt({ mood: 3 }, false);
    expect(prompt).not.toContain('undefined');
    expect(prompt).not.toContain('null');
  });

  it('flags SAFETY_FLAGGED in the prompt when the safety screen fired', () => {
    const flagged = buildOptimizedPrompt({ customNotes: 'test' }, true);
    const notFlagged = buildOptimizedPrompt({ customNotes: 'test' }, false);
    expect(flagged.prompt).toContain('SAFETY_FLAGGED: true');
    expect(notFlagged.prompt).not.toContain('SAFETY_FLAGGED: true');
  });

  it('mentions coping tools by name when provided', () => {
    const { prompt } = buildOptimizedPrompt({
      copingTools: ['Exercise', 'Journaling'],
    }, false);
    expect(prompt).toContain('Exercise');
    expect(prompt).toContain('Journaling');
  });

  it('does not leak private support-contact details into the prompt', () => {
    const { prompt } = buildOptimizedPrompt({
      supportContacts: [{ name: 'Jordan', relation: 'Friend', contact: '555-0100' }],
    }, false);
    // Should acknowledge contacts exist without echoing the private details
    expect(prompt).not.toContain('Jordan');
    expect(prompt).not.toContain('555-0100');
  });

  it('always returns the same systemPrompt regardless of input', () => {
    const a = buildOptimizedPrompt({ mood: 1 }, false);
    const b = buildOptimizedPrompt({ mood: 5, gratitude: 'x' }, true);
    expect(a.systemPrompt).toBe(b.systemPrompt);
    expect(a.systemPrompt).toBe(SYSTEM_PROMPT);
  });

  it('produces a reasonable token estimate', () => {
    const { estimatedTokens } = buildOptimizedPrompt({ mood: 3, gratitude: 'a short note' }, false);
    expect(estimatedTokens).toBeGreaterThan(0);
    expect(estimatedTokens).toBeLessThan(1000);
  });
});

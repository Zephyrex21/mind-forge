import { describe, it, expect } from 'vitest';
import {
  BREATHING_PATTERNS,
  getCycleDuration,
  getPhaseAtElapsed,
  computePhaseScales,
  easeInOutSine,
} from './breathingPatterns';

describe('getCycleDuration', () => {
  it('sums all phase durations', () => {
    expect(getCycleDuration(BREATHING_PATTERNS.box.phases)).toBe(16);
    expect(getCycleDuration(BREATHING_PATTERNS.relaxing.phases)).toBe(19);
    expect(getCycleDuration(BREATHING_PATTERNS.calm.phases)).toBe(10);
  });
});

describe('getPhaseAtElapsed', () => {
  const boxPhases = BREATHING_PATTERNS.box.phases; // Inhale4, Hold4, Exhale4, Hold4

  it('starts in the first phase at elapsed 0', () => {
    const info = getPhaseAtElapsed(boxPhases, 0);
    expect(info.phase.name).toBe('Inhale');
    expect(info.secondsIntoPhase).toBe(0);
  });

  it('finds a phase in the middle of the cycle', () => {
    const info = getPhaseAtElapsed(boxPhases, 6); // 4 (inhale) + 2 into hold
    expect(info.phase.name).toBe('Hold');
    expect(info.phaseIndex).toBe(1);
    expect(info.secondsIntoPhase).toBe(2);
  });

  it('wraps around into a second cycle', () => {
    const info = getPhaseAtElapsed(boxPhases, 16 + 2); // one full cycle + 2s
    expect(info.phase.name).toBe('Inhale');
    expect(info.completedCycles).toBe(1);
  });

  it('reports secondsLeftInPhase correctly', () => {
    const info = getPhaseAtElapsed(boxPhases, 1); // 1s into a 4s Inhale
    expect(info.secondsLeftInPhase).toBe(3);
  });

  it('returns null for a phase set with zero total duration', () => {
    expect(getPhaseAtElapsed([], 5)).toBeNull();
  });

  it('handles the last phase correctly right at the cycle boundary', () => {
    const info = getPhaseAtElapsed(boxPhases, 15.9);
    expect(info.phaseIndex).toBe(3); // second Hold
  });
});

describe('computePhaseScales', () => {
  it('grows to the peak scale on Inhale and shrinks back on Exhale', () => {
    const scales = computePhaseScales(BREATHING_PATTERNS.calm.phases, 0.8, 1.35);
    expect(scales[0]).toEqual({ startScale: 0.8, endScale: 1.35 }); // Inhale
    expect(scales[1]).toEqual({ startScale: 1.35, endScale: 0.8 }); // Exhale
  });

  it('carries the scale forward unchanged through a Hold phase', () => {
    const scales = computePhaseScales(BREATHING_PATTERNS.box.phases, 0.8, 1.35);
    // Inhale -> Hold -> Exhale -> Hold
    expect(scales[1]).toEqual({ startScale: 1.35, endScale: 1.35 }); // Hold after Inhale
    expect(scales[3]).toEqual({ startScale: 0.8, endScale: 0.8 }); // Hold after Exhale
  });
});

describe('easeInOutSine', () => {
  it('starts at 0 and ends at 1', () => {
    expect(easeInOutSine(0)).toBeCloseTo(0);
    expect(easeInOutSine(1)).toBeCloseTo(1);
  });

  it('is exactly 0.5 at the midpoint', () => {
    expect(easeInOutSine(0.5)).toBeCloseTo(0.5);
  });
});

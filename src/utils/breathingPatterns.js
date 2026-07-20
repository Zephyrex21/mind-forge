/**
 * Pure timing/scale math for the guided breathing exercise. Kept separate
 * from the component so the phase-cycling and scale-interpolation logic
 * can be unit tested without a DOM, timers, or requestAnimationFrame.
 */

export const BREATHING_PATTERNS = {
  box: {
    label: 'Box Breathing',
    description: 'Equal-count inhale, hold, exhale, hold — steadies a racing mind.',
    phases: [
      { name: 'Inhale', duration: 4 },
      { name: 'Hold', duration: 4 },
      { name: 'Exhale', duration: 4 },
      { name: 'Hold', duration: 4 },
    ],
  },
  relaxing: {
    label: '4-7-8 Relaxing Breath',
    description: 'A longer exhale than inhale — commonly used to help wind down.',
    phases: [
      { name: 'Inhale', duration: 4 },
      { name: 'Hold', duration: 7 },
      { name: 'Exhale', duration: 8 },
    ],
  },
  calm: {
    label: 'Simple Calm Breathing',
    description: 'A gentle, easy rhythm — a good starting point if the others feel like a lot.',
    phases: [
      { name: 'Inhale', duration: 4 },
      { name: 'Exhale', duration: 6 },
    ],
  },
};

export function getCycleDuration(phases) {
  return phases.reduce((sum, p) => sum + p.duration, 0);
}

/**
 * Given a set of phases and how many seconds have elapsed since the
 * session started, figures out which phase is active *right now* and how
 * far into it we are. Computed from absolute elapsed time (not decremented
 * tick-by-tick), so it can't drift even if timers get throttled in a
 * background tab.
 */
export function getPhaseAtElapsed(phases, elapsedSeconds) {
  const cycleDuration = getCycleDuration(phases);
  if (cycleDuration <= 0) return null;

  const cycleElapsed = ((elapsedSeconds % cycleDuration) + cycleDuration) % cycleDuration;
  const completedCycles = Math.floor(elapsedSeconds / cycleDuration);

  let acc = 0;
  for (let i = 0; i < phases.length; i += 1) {
    const next = acc + phases[i].duration;
    if (cycleElapsed < next) {
      return {
        phaseIndex: i,
        phase: phases[i],
        secondsIntoPhase: cycleElapsed - acc,
        secondsLeftInPhase: next - cycleElapsed,
        completedCycles,
      };
    }
    acc = next;
  }

  const lastIndex = phases.length - 1;
  return {
    phaseIndex: lastIndex,
    phase: phases[lastIndex],
    secondsIntoPhase: phases[lastIndex].duration,
    secondsLeftInPhase: 0,
    completedCycles,
  };
}

/**
 * Precomputes a start/end circle scale for each phase in sequence: Inhale
 * grows toward peakScale, Exhale shrinks back to baseScale, Hold phases
 * simply carry forward whatever scale the previous phase ended at.
 */
export function computePhaseScales(phases, baseScale = 0.8, peakScale = 1.35) {
  let current = baseScale;
  return phases.map((p) => {
    let endScale = current;
    if (p.name === 'Inhale') endScale = peakScale;
    else if (p.name === 'Exhale') endScale = baseScale;
    const result = { startScale: current, endScale };
    current = endScale;
    return result;
  });
}

/** Symmetric ease — starts and ends slow, fastest in the middle — so the
 * circle's growth/shrink feels like a breath rather than a linear tween. */
export function easeInOutSine(x) {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTheme } from '../../app/providers/ThemeProvider';
import {
  BREATHING_PATTERNS,
  getPhaseAtElapsed,
  computePhaseScales,
  easeInOutSine,
} from '../../utils/breathingPatterns';

const DURATION_OPTIONS = [1, 3, 5];

/**
 * A self-contained guided breathing exercise: pick a pattern and a
 * duration, then a circle grows/shrinks in sync with an inhale-hold-exhale
 * cycle. The circle's transform is written directly to the DOM via a ref
 * inside a requestAnimationFrame loop rather than through React state —
 * at ~60fps that would be a lot of re-renders for a value that only ever
 * affects one inline style.
 */
export default function BreathingExercise() {
  const { vc, isDark } = useTheme();

  const [patternKey, setPatternKey] = useState('box');
  const [durationMinutes, setDurationMinutes] = useState(3);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [phaseLabel, setPhaseLabel] = useState('Ready');
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);

  const circleRef = useRef(null);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null); // Date.now() at the most recent (re)start
  const elapsedBeforePauseRef = useRef(0); // seconds banked from prior runs this session

  const pattern = BREATHING_PATTERNS[patternKey];
  const scaleMap = useMemo(() => computePhaseScales(pattern.phases), [pattern]);
  const totalSeconds = durationMinutes * 60;

  // Reset the session whenever the pattern or duration changes while
  // stopped (changing either mid-session would make "time remaining"
  // and the phase math ambiguous, so those controls are disabled while running).
  useEffect(() => {
    if (isRunning) return;
    elapsedBeforePauseRef.current = 0;
    setSecondsLeft(totalSeconds);
    setIsComplete(false);
    setPhaseLabel('Ready');
    if (circleRef.current) circleRef.current.style.transform = 'scale(0.8)';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patternKey, durationMinutes]);

  useEffect(() => {
    if (!isRunning) return undefined;

    const tick = () => {
      const elapsed = elapsedBeforePauseRef.current + (Date.now() - startTimeRef.current) / 1000;

      if (elapsed >= totalSeconds) {
        setIsRunning(false);
        setIsComplete(true);
        setSecondsLeft(0);
        setPhaseLabel('Complete');
        if (circleRef.current) circleRef.current.style.transform = 'scale(1)';
        return;
      }

      setSecondsLeft(Math.max(0, Math.ceil(totalSeconds - elapsed)));

      const info = getPhaseAtElapsed(pattern.phases, elapsed);
      if (info) {
        const { startScale, endScale } = scaleMap[info.phaseIndex];
        const progress = info.phase.duration > 0 ? info.secondsIntoPhase / info.phase.duration : 1;
        const scale = startScale + (endScale - startScale) * easeInOutSine(progress);
        if (circleRef.current) circleRef.current.style.transform = `scale(${scale.toFixed(3)})`;
        setPhaseLabel(info.phase.name);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isRunning, pattern, scaleMap, totalSeconds]);

  const handleStart = () => {
    // Starting again after a full completion should restart the session,
    // not "resume" from an already-elapsed total (which would otherwise
    // immediately re-trigger completion on the very next tick).
    if (isComplete || secondsLeft <= 0) {
      elapsedBeforePauseRef.current = 0;
      setSecondsLeft(totalSeconds);
    }
    startTimeRef.current = Date.now();
    setIsComplete(false);
    setIsRunning(true);
  };

  const handlePause = () => {
    elapsedBeforePauseRef.current += (Date.now() - startTimeRef.current) / 1000;
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    elapsedBeforePauseRef.current = 0;
    setSecondsLeft(totalSeconds);
    setIsComplete(false);
    setPhaseLabel('Ready');
    if (circleRef.current) circleRef.current.style.transform = 'scale(0.8)';
  };

  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, '0');

  // True while a session is paused partway through — changing the pattern
  // or duration here would silently reset that progress, so the controls
  // stay disabled until the person resets or finishes.
  const sessionInProgress = !isComplete && secondsLeft < totalSeconds;
  const settingsLocked = isRunning || sessionInProgress;

  return (
    <div className="flex flex-col items-center text-center">
      {/* Pattern picker */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {Object.entries(BREATHING_PATTERNS).map(([key, p]) => (
          <button
            key={key}
            disabled={settingsLocked}
            onClick={() => setPatternKey(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              patternKey === key
                ? 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30'
                : isDark ? 'border-gray-800 bg-gray-900 text-gray-400' : 'border-gray-200 bg-white text-gray-600'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <p className={`text-xs mb-8 max-w-sm ${vc.textSec}`}>{pattern.description}</p>

      {/* Breathing circle */}
      <div className="relative w-56 h-56 flex items-center justify-center mb-8">
        <div className={`absolute inset-0 rounded-full border-2 ${isDark ? 'border-gray-800' : 'border-gray-200'}`} />
        <div
          ref={circleRef}
          className="absolute w-40 h-40 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 opacity-80"
          style={{ transform: 'scale(0.8)' }}
        />
        <div className="relative z-10 flex flex-col items-center">
          <span className="text-lg font-bold text-white drop-shadow">{phaseLabel}</span>
          <span className="text-xs font-mono text-white/90 drop-shadow mt-1">{mm}:{ss}</span>
        </div>
      </div>

      {isComplete && (
        <p className="text-sm font-semibold text-emerald-500 mb-4">
          Nice work — that's a full session. Notice how you feel right now.
        </p>
      )}

      {/* Duration picker */}
      <div className="flex items-center gap-2 mb-6">
        <span className={`text-xs font-semibold ${vc.textSec}`}>Duration:</span>
        {DURATION_OPTIONS.map((mins) => (
          <button
            key={mins}
            disabled={settingsLocked}
            onClick={() => setDurationMinutes(mins)}
            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              durationMinutes === mins
                ? 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30'
                : isDark ? 'border-gray-800 bg-gray-900 text-gray-400' : 'border-gray-200 bg-white text-gray-600'
            }`}
          >
            {mins} min
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm transition-colors"
          >
            <Play className="w-4 h-4 fill-current" /> {!isComplete && secondsLeft < totalSeconds ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold text-sm transition-colors"
          >
            <Pause className="w-4 h-4 fill-current" /> Pause
          </button>
        )}
        <button
          onClick={handleReset}
          className={`p-3 rounded-xl border transition-colors ${isDark ? 'border-gray-800 text-gray-400 hover:text-white' : 'border-gray-200 text-gray-500 hover:text-gray-900'}`}
          aria-label="Reset session"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * A soft radial glow that follows the mouse cursor across the whole page —
 * purely decorative ambient texture, sitting just above the FloatingOrbs
 * background layer. Uses gsap.quickTo for smooth, cheap tracking (updates
 * a transform, not layout, so it never triggers reflow).
 *
 * Disabled entirely for prefers-reduced-motion and for coarse/touch
 * pointers (there's no persistent cursor to follow on a touchscreen, so
 * the effect would just sit uselessly in a stale spot).
 */
export default function CursorGlow() {
  const glowRef = useRef(null);

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (reducedMotion || !hasFinePointer) {
      el.style.display = 'none';
      return undefined;
    }

    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });

    const handleMove = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
      <div
        ref={glowRef}
        className="absolute w-[420px] h-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, rgba(99,102,241,0) 70%)',
        }}
      />
    </div>
  );
}

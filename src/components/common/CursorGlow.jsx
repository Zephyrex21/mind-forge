import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const GLOW_SIZE = 420;

/**
 * A soft radial glow that follows the mouse cursor across the whole page —
 * purely decorative ambient texture, sitting just above the FloatingOrbs
 * background layer. Uses Framer Motion's useSpring for smooth, cheap
 * tracking (updates a transform, not layout, so it never triggers reflow)
 * — the same animation library already used everywhere else on this page,
 * rather than pulling in a second one just for this.
 *
 * The centering offset (half the glow's size) is baked directly into the
 * tracked x/y values rather than applied via a CSS translate-1/2 utility
 * class — Framer Motion writes the element's `transform` inline, which
 * would otherwise silently override a class-based transform rather than
 * combining with it.
 *
 * Disabled entirely for prefers-reduced-motion and for coarse/touch
 * pointers (there's no persistent cursor to follow on a touchscreen, so
 * the effect would just sit uselessly in a stale spot).
 */
export default function CursorGlow() {
  const mouseX = useMotionValue(-GLOW_SIZE);
  const mouseY = useMotionValue(-GLOW_SIZE);
  const springX = useSpring(mouseX, { damping: 26, stiffness: 170, mass: 0.5 });
  const springY = useSpring(mouseY, { damping: 26, stiffness: 170, mass: 0.5 });

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (reducedMotion || !hasFinePointer) return undefined;

    const handleMove = (e) => {
      mouseX.set(e.clientX - GLOW_SIZE / 2);
      mouseY.set(e.clientY - GLOW_SIZE / 2);
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [mouseX, mouseY]);

  return (
    <div aria-hidden="true" className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
      <motion.div
        className="absolute rounded-full"
        style={{
          width: GLOW_SIZE,
          height: GLOW_SIZE,
          background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, rgba(99,102,241,0) 70%)',
          x: springX,
          y: springY,
        }}
      />
    </div>
  );
}

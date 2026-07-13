import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Decorative, ambient floating gradient orbs — pure background atmosphere,
 * no interactive content. Fixed to the viewport so they drift gently behind
 * the page as you scroll, rather than being tied to one section.
 *
 * Purely visual: aria-hidden, no pointer events, sits behind everything.
 * Respects prefers-reduced-motion — orbs still render for visual texture,
 * they just stay still instead of drifting for users who've asked for
 * reduced motion (continuous looping motion can genuinely cause discomfort
 * for vestibular disorders, this isn't just a style nicety).
 */
export default function FloatingOrbs() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handleChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const orbs = [
    { size: 420, color: 'bg-indigo-500/20 dark:bg-indigo-500/10', top: '-5%', left: '-8%', dur: 22, xr: 60, yr: 40 },
    { size: 360, color: 'bg-purple-500/15 dark:bg-purple-500/10', top: '55%', left: '78%', dur: 26, xr: -50, yr: 50 },
    { size: 300, color: 'bg-pink-400/10 dark:bg-pink-500/10', top: '25%', left: '55%', dur: 30, xr: 40, yr: -60 },
    { size: 260, color: 'bg-indigo-400/15 dark:bg-indigo-400/10', top: '80%', left: '15%', dur: 24, xr: -45, yr: -35 },
  ];

  return (
    <div aria-hidden="true" className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl ${orb.color}`}
          style={{ width: orb.size, height: orb.size, top: orb.top, left: orb.left }}
          animate={reducedMotion ? {} : {
            x: [0, orb.xr, 0],
            y: [0, orb.yr, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: orb.dur,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

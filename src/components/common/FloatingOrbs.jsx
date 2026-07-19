import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * A single orb. Split out from FloatingOrbs so each instance can safely
 * call its own useTransform hook (rules-of-hooks requires a stable number
 * of hook calls per component — mapping and calling a hook inline inside
 * the array callback would violate that).
 *
 * Two layers of motion are applied to two nested elements rather than the
 * same one, since combining a scroll-linked `style.y` motion value with a
 * looping `animate.y` keyframe on the same element would fight for control
 * of the same transform property.
 */
function Orb({ orb, scrollY, reducedMotion }) {
  const y = useTransform(scrollY, [0, 2400], [0, orb.parallax]);

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: orb.top,
        left: orb.left,
        width: orb.size,
        height: orb.size,
        y: reducedMotion ? 0 : y,
      }}
    >
      <motion.div
        className={`w-full h-full rounded-full blur-3xl ${orb.color}`}
        animate={
          reducedMotion
            ? {}
            : {
                x: [0, orb.xr, 0],
                y: [0, orb.yr, 0],
                scale: [1, 1.15, 1],
              }
        }
        transition={{
          duration: orb.dur,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
}

/**
 * Decorative, ambient floating gradient orbs — pure background atmosphere,
 * no interactive content. Fixed to the viewport so they drift gently behind
 * the page as you scroll, rather than being tied to one section. Each orb
 * also shifts at its own depth as the page scrolls, for a subtle parallax
 * layering effect on top of the ambient looping drift.
 *
 * Purely visual: aria-hidden, no pointer events, sits behind everything.
 * Respects prefers-reduced-motion — orbs still render for visual texture,
 * they just stay still instead of drifting (or parallaxing) for users
 * who've asked for reduced motion (continuous looping motion can genuinely
 * cause discomfort for vestibular disorders, this isn't just a style
 * nicety).
 */
export default function FloatingOrbs() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handleChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const orbs = [
    { size: 420, color: 'bg-indigo-500/20 dark:bg-indigo-500/10', top: '-5%', left: '-8%', dur: 22, xr: 60, yr: 40, parallax: -100 },
    { size: 360, color: 'bg-purple-500/15 dark:bg-purple-500/10', top: '55%', left: '78%', dur: 26, xr: -50, yr: 50, parallax: 140 },
    { size: 300, color: 'bg-pink-400/10 dark:bg-pink-500/10', top: '25%', left: '55%', dur: 30, xr: 40, yr: -60, parallax: -70 },
    { size: 260, color: 'bg-indigo-400/15 dark:bg-indigo-400/10', top: '80%', left: '15%', dur: 24, xr: -45, yr: -35, parallax: 110 },
  ];

  return (
    <div aria-hidden="true" className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {orbs.map((orb, i) => (
        <Orb key={i} orb={orb} scrollY={scrollY} reducedMotion={reducedMotion} />
      ))}
    </div>
  );
}

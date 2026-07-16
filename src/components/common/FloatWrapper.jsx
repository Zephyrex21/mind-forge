import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Wraps its children in a gentle, continuous up-down float — meant to sit
 * *inside* an element that already has its own one-time entrance animation
 * (fade/slide/scale in), since combining a settle-to-position animation and
 * an infinite loop on the same motion element would conflict. This is the
 * "then float forever" half of that pattern.
 *
 * Respects prefers-reduced-motion, same reasoning as FloatingOrbs — a
 * constant, unstoppable bob is exactly the kind of motion that can genuinely
 * bother people with vestibular sensitivity.
 */
export default function FloatWrapper({ children, distance = 10, duration = 4, className = '' }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handleChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <motion.div
      className={className}
      animate={reducedMotion ? {} : { y: [0, -distance, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

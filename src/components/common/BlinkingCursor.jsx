import React from 'react';
import { motion } from 'framer-motion';

/**
 * A blinking terminal-style cursor block — the single highest-value visual
 * cue for making a fake terminal mockup read as "live" rather than a static
 * screenshot. Inline-block so it sits at the end of a text line.
 */
export default function BlinkingCursor({ className = '' }) {
  return (
    <motion.span
      aria-hidden="true"
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear', times: [0, 0.5, 0.5, 1] }}
      className={`inline-block w-[7px] h-[13px] bg-indigo-500 dark:bg-indigo-400 align-middle ml-0.5 ${className}`}
    />
  );
}

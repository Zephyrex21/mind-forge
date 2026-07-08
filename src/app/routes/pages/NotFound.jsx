import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../providers/ThemeProvider';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

// Page transitions definition
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.18, ease: 'easeIn' } }
};

export default function NotFound() {
  const { isDark } = useTheme();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`min-h-screen flex flex-col justify-center items-center p-6 text-center transition-colors duration-300 ${
        isDark ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'
      }`}
    >
      <div className="space-y-6 max-w-md">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-red-500 ${
          isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
        }`}>
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className={`text-3xl font-extrabold tracking-tight sm:text-4xl ${isDark ? 'text-white' : 'text-gray-950'}`}>404: Route Not Found</h1>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            The page you are trying to visit does not exist or has been relocated to another workspace route.
          </p>
        </div>

        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 text-white font-semibold text-sm transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Homepage
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

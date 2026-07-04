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
  const { vc } = useTheme();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-[#0D1117] text-[#F3F4F6] flex flex-col justify-center items-center p-6 text-center"
    >
      <div className="space-y-6 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center mx-auto text-[#EF4444]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">404: Route Not Found</h1>
          <p className="text-sm text-[#9CA3AF] leading-relaxed">
            The page you are trying to visit does not exist or has been relocated to another workspace route.
          </p>
        </div>

        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#5B8CFF] to-[#4F7AFF] hover:from-[#4F7AFF] hover:to-[#5B8CFF] text-white font-semibold text-sm transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Homepage
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

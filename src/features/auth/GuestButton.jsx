import React from 'react';
import { UserRound } from 'lucide-react';

export default function GuestButton({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <UserRound className="w-4 h-4" />
      Continue as Guest
    </button>
  );
}

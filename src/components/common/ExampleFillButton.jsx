import React from 'react';
import { Wand2 } from 'lucide-react';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useGenerator } from '../../hooks/useGenerator';
import { EXAMPLE_DATA } from '../../constants/exampleData';

/**
 * Small "Use example" link shown on each wizard step — fills that step's
 * fields with realistic sample content, purely to make manual testing fast.
 * Never triggered automatically.
 */
export default function ExampleFillButton({ stepKey }) {
  const { updateForm } = useGenerator();
  const { isDark } = useTheme();
  const example = EXAMPLE_DATA[stepKey];

  if (!example) return null;

  const fill = () => {
    Object.entries(example).forEach(([key, value]) => updateForm(key, value));
  };

  return (
    <button
      type="button"
      onClick={fill}
      className={`flex items-center gap-1.5 text-xs font-medium mb-4 transition-colors ${
        isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
      }`}
    >
      <Wand2 className="w-3.5 h-3.5" /> Use example answer
    </button>
  );
}

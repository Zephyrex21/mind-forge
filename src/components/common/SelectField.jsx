import React, { useId } from 'react';
import { useTheme } from '../../app/providers/ThemeProvider';

/**
 * Reusable select dropdown with label.
 */
export default function SelectField({ label, value, onChange, options }) {
  const { vc, fontClass } = useTheme();
  const id = useId();

  return (
    <div className="mb-4">
      <label htmlFor={id} className={`block text-sm font-medium mb-1.5 ${vc.text}`}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full px-4 py-2.5 rounded-lg transition-all outline-none ${fontClass} ${vc.input}`}
      >
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

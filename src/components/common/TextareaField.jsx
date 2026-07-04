import React from 'react';
import { useTheme } from '../../app/providers/ThemeProvider';

/**
 * Reusable textarea field with label and optional character limit.
 */
export default function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  maxLen,
  ...props
}) {
  const { vc, fontClass } = useTheme();

  const handleChange = (e) => {
    if (maxLen && e.target.value.length > maxLen) return;
    onChange(e.target.value);
  };

  return (
    <div className="mb-4">
      <label className={`block text-sm font-medium mb-1.5 ${vc.text}`}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-2.5 rounded-lg transition-all outline-none resize-none ${fontClass} ${vc.input}`}
        {...props}
      />
      {maxLen && (
        <p className={`text-xs mt-1 text-right ${vc.textSec}`}>
          {value.length}/{maxLen}
        </p>
      )}
    </div>
  );
}

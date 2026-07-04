import React from 'react';
import { useTheme } from '../../app/providers/ThemeProvider';

/**
 * Reusable text input field with label and optional required indicator.
 */
export default function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  ...props
}) {
  const { vc, fontClass } = useTheme();

  return (
    <div className="mb-4">
      <label className={`block text-sm font-medium mb-1.5 ${vc.text}`}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-lg transition-all outline-none ${fontClass} ${vc.input}`}
        {...props}
      />
    </div>
  );
}

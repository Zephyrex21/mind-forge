import React, { useId } from 'react';
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
  const id = useId();

  return (
    <div className="mb-4">
      <label htmlFor={id} className={`block text-sm font-medium mb-1.5 ${vc.text}`}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-2.5 rounded-lg transition-all outline-none ${fontClass} ${vc.input}`}
        {...props}
      />
    </div>
  );
}

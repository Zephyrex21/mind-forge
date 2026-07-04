import React from 'react';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useGenerator } from '../../../hooks/useGenerator';
import TextareaField from '../../../components/common/TextareaField';

export default function CustomStep() {
  const { vc } = useTheme();
  const { formData, updateForm } = useGenerator();

  return (
    <div className="animate-fade-in">
      <h2 className={`text-2xl font-bold mb-1 ${vc.text}`}>Custom Notes</h2>
      <p className={`mb-6 ${vc.textSec}`}>Anything else on your mind that doesn't fit elsewhere</p>
      <TextareaField
        label="Notes"
        value={formData.customNotes}
        onChange={v => updateForm('customNotes', v)}
        placeholder="Free-write anything — this stays with your check-in."
        maxLen={1000}
        rows={8}
      />
    </div>
  );
}

import React from 'react';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useGenerator } from '../../../hooks/useGenerator';
import TextareaField from '../../../components/common/TextareaField';

export default function GratitudeStep() {
  const { vc } = useTheme();
  const { formData, updateForm } = useGenerator();

  return (
    <div className="animate-fade-in">
      <h2 className={`text-2xl font-bold mb-1 ${vc.text}`}>Gratitude & Reflection</h2>
      <p className={`mb-6 ${vc.textSec}`}>What went well today, even something small?</p>
      <TextareaField
        label="Gratitude"
        value={formData.gratitude}
        onChange={v => updateForm('gratitude', v)}
        placeholder="My friend checked in on me today, the weather was nice, I finished a task I'd been avoiding..."
        maxLen={800}
        rows={4}
      />
    </div>
  );
}

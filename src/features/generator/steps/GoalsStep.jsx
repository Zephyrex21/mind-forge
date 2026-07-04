import React from 'react';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useGenerator } from '../../../hooks/useGenerator';
import TextareaField from '../../../components/common/TextareaField';

export default function GoalsStep() {
  const { vc } = useTheme();
  const { formData, updateForm } = useGenerator();

  return (
    <div className="animate-fade-in">
      <h2 className={`text-2xl font-bold mb-1 ${vc.text}`}>Current Wellness Goals</h2>
      <p className={`mb-6 ${vc.textSec}`}>What are you working toward right now?</p>
      <TextareaField
        label="Goals"
        value={formData.goals}
        onChange={v => updateForm('goals', v)}
        placeholder="Sleep 7+ hours consistently, go for a walk 3x a week, reach out to a friend when things feel heavy..."
        maxLen={500}
        rows={4}
      />
    </div>
  );
}

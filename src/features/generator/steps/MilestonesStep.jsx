import React from 'react';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useGenerator } from '../../../hooks/useGenerator';
import TextareaField from '../../../components/common/TextareaField';

export default function MilestonesStep() {
  const { vc } = useTheme();
  const { formData, updateForm } = useGenerator();

  return (
    <div className="animate-fade-in">
      <h2 className={`text-2xl font-bold mb-1 ${vc.text}`}>Wellness Milestones</h2>
      <p className={`mb-6 ${vc.textSec}`}>Progress worth celebrating — however small</p>
      <TextareaField
        label="What have you accomplished lately?"
        value={formData.milestones}
        onChange={v => updateForm('milestones', v)}
        placeholder="Finished a 30-day meditation streak, went to my first therapy session, got through a tough week..."
        maxLen={500}
        rows={4}
      />
    </div>
  );
}

import React from 'react';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useGenerator } from '../../../hooks/useGenerator';
import TextareaField from '../../../components/common/TextareaField';
import ExampleFillButton from '../../../components/common/ExampleFillButton';

export default function AboutYouStep() {
  const { vc } = useTheme();
  const { formData, updateForm } = useGenerator();

  return (
    <div className="animate-fade-in">
      <h2 className={`text-2xl font-bold mb-1 ${vc.text}`}>About You</h2>
      <p className={`mb-6 ${vc.textSec}`}>A quick word on what's going on for you right now</p>

      <ExampleFillButton stepKey="about-you" />

      <TextareaField
        label="What's your current focus in life?"
        value={formData.currentFocus}
        onChange={v => updateForm('currentFocus', v)}
        placeholder="Starting a new job, recovering from a rough patch, just trying to get through the week..."
        maxLen={300}
        rows={3}
      />

      <TextareaField
        label="What's your intention for today? (optional)"
        value={formData.intention}
        onChange={v => updateForm('intention', v)}
        placeholder="Be a little kinder to myself today"
        maxLen={300}
        rows={2}
      />
    </div>
  );
}

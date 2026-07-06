import React from 'react';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useGenerator } from '../../../hooks/useGenerator';
import InputField from '../../../components/common/InputField';
import ScaleSelector from '../../../components/common/ScaleSelector';
import { MOOD_LABELS, ENERGY_LABELS, SLEEP_QUALITY_LABELS } from '../../../constants/options';

export default function MoodEnergyStep() {
  const { vc } = useTheme();
  const { formData, updateForm } = useGenerator();

  return (
    <div className="animate-fade-in">
      <h2 className={`text-2xl font-bold mb-1 ${vc.text}`}>Mood & Energy</h2>
      <p className={`mb-6 ${vc.textSec}`}>The core of today's check-in — be honest, not "correct"</p>

      <ScaleSelector label="How's your mood today?" value={formData.mood} onChange={v => updateForm('mood', v)} labels={MOOD_LABELS} />
      <ScaleSelector label="How's your energy?" value={formData.energy} onChange={v => updateForm('energy', v)} labels={ENERGY_LABELS} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <InputField
          label="Hours of sleep last night"
          type="number"
          min="0" max="24" step="0.5"
          value={formData.sleepHours}
          onChange={v => {
            if (v === '') return updateForm('sleepHours', '');
            const num = Number(v);
            if (Number.isNaN(num)) return;
            updateForm('sleepHours', Math.min(Math.max(num, 0), 24));
          }}
          placeholder="7.5"
        />
        <div />
      </div>

      <ScaleSelector label="Sleep quality" value={formData.sleepQuality} onChange={v => updateForm('sleepQuality', v)} labels={SLEEP_QUALITY_LABELS} />
    </div>
  );
}

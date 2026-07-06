import React from 'react';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useGenerator } from '../../../hooks/useGenerator';
import TextareaField from '../../../components/common/TextareaField';
import { COPING_TOOL_OPTIONS } from '../../../constants/options';
import ExampleFillButton from '../../../components/common/ExampleFillButton';

export default function CopingToolsStep() {
  const { vc, isDark } = useTheme();
  const { formData, updateForm } = useGenerator();

  const toggleTool = (tool) => {
    const current = formData.copingTools;
    updateForm('copingTools', current.includes(tool) ? current.filter(x => x !== tool) : [...current, tool]);
  };

  return (
    <div className="animate-fade-in">
      <h2 className={`text-2xl font-bold mb-1 ${vc.text}`}>Coping Tools & Support Systems</h2>
      <p className={`mb-6 ${vc.textSec}`}>What helps you get through hard moments? Pick everything that applies</p>

      <ExampleFillButton stepKey="coping-tools" />

      <label className={`block text-sm font-medium mb-2 ${vc.text}`}>Tools you use</label>
      <div className="flex flex-wrap gap-2 mb-5">
        {COPING_TOOL_OPTIONS.map(tool => (
          <button
            key={tool}
            type="button"
            onClick={() => toggleTool(tool)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
              formData.copingTools.includes(tool)
                ? vc.tabActive
                : vc.tabInactive + ' border ' + (isDark ? 'border-gray-700' : 'border-gray-200')
            }`}
          >
            {tool}
          </button>
        ))}
      </div>

      <TextareaField
        label="Anything you want to note about how you used them today? (optional)"
        value={formData.copingNotes}
        onChange={v => updateForm('copingNotes', v)}
        placeholder="Went for a 20-minute walk after lunch, it helped clear my head..."
        maxLen={500}
        rows={3}
      />
    </div>
  );
}

import React from 'react';
import { LifeBuoy, Phone } from 'lucide-react';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { CRISIS_RESOURCES } from '../../../constants/crisisResources';

/**
 * Informational only — no data entry. Always shown in the check-in flow
 * as a reminder that real help is always available, not gated behind
 * anything the AI decides.
 */
export default function CrisisResourcesStep() {
  const { vc, isDark } = useTheme();

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <LifeBuoy className="w-6 h-6 text-rose-500" />
        <h2 className={`text-2xl font-bold ${vc.text}`}>Crisis Resources</h2>
      </div>
      <p className={`mb-6 ${vc.textSec}`}>
        MindForge is a journaling companion, not a crisis service. If you're in crisis or thinking about harming yourself, please reach out to real, immediate help.
      </p>

      <div className="space-y-2.5">
        {CRISIS_RESOURCES.map((r) => (
          <div key={r.name} className={`flex items-center gap-3 p-4 rounded-xl border ${isDark ? 'bg-gray-900/30 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-rose-500/10' : 'bg-rose-50'}`}>
              <Phone className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${vc.text}`}>{r.name}</p>
              <p className={`text-xs ${vc.textSec}`}>{r.region} · {r.contact}</p>
            </div>
          </div>
        ))}
      </div>

      <p className={`text-xs mt-6 ${vc.textSec}`}>
        This is not a substitute for professional mental health care. If you're ever unsure, reaching out to one of the resources above is always the right call.
      </p>
    </div>
  );
}

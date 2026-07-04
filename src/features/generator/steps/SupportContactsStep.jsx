import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Trash2, Plus, Lock } from 'lucide-react';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useGenerator } from '../../../hooks/useGenerator';
import InputField from '../../../components/common/InputField';
import SelectField from '../../../components/common/SelectField';
import { SUPPORT_RELATIONS } from '../../../constants/options';

export default function SupportContactsStep() {
  const { vc } = useTheme();
  const { formData, updateForm } = useGenerator();
  const [expanded, setExpanded] = useState(-1);

  const contacts = formData.supportContacts;

  const addContact = () => {
    if (contacts.length < 5) {
      updateForm('supportContacts', [...contacts, { name: '', relation: SUPPORT_RELATIONS[0], contact: '' }]);
      setExpanded(contacts.length);
    }
  };

  const updateContact = (i, key, val) => {
    const updated = [...contacts];
    updated[i] = { ...updated[i], [key]: val };
    updateForm('supportContacts', updated);
  };

  const removeContact = (i) => {
    updateForm('supportContacts', contacts.filter((_, idx) => idx !== i));
    setExpanded(-1);
  };

  return (
    <div className="animate-fade-in">
      <h2 className={`text-2xl font-bold mb-1 ${vc.text}`}>Support Contacts</h2>
      <p className={`mb-1 ${vc.textSec}`}>People you can lean on — completely optional</p>
      <p className={`mb-6 text-xs flex items-center gap-1.5 ${vc.textSec}`}>
        <Lock className="w-3 h-3" /> Private to your account — never shared or shown to anyone else
      </p>

      <div className="space-y-3">
        {contacts.map((c, i) => (
          <div key={i} className={`rounded-xl border overflow-hidden transition-all ${vc.card}`}>
            <div
              onClick={() => setExpanded(expanded === i ? -1 : i)}
              className={`w-full flex items-center justify-between p-4 text-left cursor-pointer ${vc.text}`}
            >
              <span className="font-medium text-sm">{c.name || `Contact ${i + 1}`}</span>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); removeContact(i); }} className="p-1 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                {expanded === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
            {expanded === i && (
              <div className="px-4 pb-4 border-t border-gray-200 pt-4 animate-fade-in">
                <InputField label="Name" value={c.name} onChange={v => updateContact(i, 'name', v)} placeholder="Jordan" />
                <SelectField label="Relation" value={c.relation} onChange={v => updateContact(i, 'relation', v)} options={SUPPORT_RELATIONS} />
                <InputField label="Contact (phone, email — optional)" value={c.contact} onChange={v => updateContact(i, 'contact', v)} placeholder="555-0100" />
              </div>
            )}
          </div>
        ))}
      </div>

      {contacts.length < 5 && (
        <button onClick={addContact} className={`mt-4 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all active:scale-95 ${vc.btnSec}`}>
          <Plus className="w-4 h-4" /> Add Support Contact
        </button>
      )}
    </div>
  );
}

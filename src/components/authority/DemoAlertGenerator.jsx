import React from 'react';
import { PlusCircle, Sparkles, Trash2 } from 'lucide-react';
import { createDemoEmergencyRecord, saveEmergency, saveAllEmergencies } from '../../utils/storage';

export default function DemoAlertGenerator({ onEmergencyCreated, onClearAll }) {
  const handleLoadDemo = () => {
    const demoRecord = createDemoEmergencyRecord();
    saveEmergency(demoRecord);
    if (onEmergencyCreated) {
      onEmergencyCreated(demoRecord);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all prototype emergency records?')) {
      saveAllEmergencies([]);
      if (onClearAll) {
        onClearAll();
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        onClick={handleLoadDemo}
        className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
        title="Simulates an incoming passenger alert with fictional data & sample GPS coordinates"
      >
        <Sparkles className="w-4 h-4 text-amber-200" />
        <span>+ Load Demo Emergency</span>
      </button>

      <button
        type="button"
        onClick={handleClearAll}
        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        title="Clear all stored prototype alerts"
      >
        <Trash2 className="w-3.5 h-3.5 text-slate-500" />
        <span className="hidden sm:inline">Reset / Clear All</span>
      </button>
    </div>
  );
}

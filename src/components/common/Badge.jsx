import React from 'react';
import { getStatusStyle } from '../../utils/formatters';

export default function Badge({ status, isDemo, size = 'md' }) {
  const style = getStatusStyle(status);

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5'
  }[size] || 'text-xs px-2.5 py-1';

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${style.badgeBg} ${style.badgeText} ${style.badgeBorder} ${sizeClasses}`}
      >
        <span className={`w-2 h-2 rounded-full ${style.dot} ${status === 'ACTIVE' ? 'animate-pulse' : ''}`} />
        {style.label}
      </span>

      {isDemo && (
        <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
          Demo Record
        </span>
      )}
    </div>
  );
}

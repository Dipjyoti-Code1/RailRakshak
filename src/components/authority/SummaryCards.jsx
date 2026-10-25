import React from 'react';
import { AlertCircle, Clock, CheckCircle2, ShieldAlert, Activity, Users } from 'lucide-react';

export default function SummaryCards({ emergencies = [], activeFilter, onSelectFilter }) {
  // Dynamically calculate metrics from saved records
  const total = emergencies.length;
  const active = emergencies.filter(e => e.emergency?.status === 'ACTIVE').length;
  const acknowledged = emergencies.filter(e => e.emergency?.status === 'ACKNOWLEDGED').length;
  const inProgress = emergencies.filter(e => e.emergency?.status === 'IN PROGRESS').length;
  const resolved = emergencies.filter(e => e.emergency?.status === 'RESOLVED').length;

  const cards = [
    {
      id: 'ALL',
      title: 'Total Emergencies',
      count: total,
      icon: Users,
      color: 'slate',
      bgLight: 'bg-slate-50',
      border: 'border-slate-200',
      textColor: 'text-slate-900',
      iconColor: 'text-slate-600',
      ringColor: 'ring-slate-400'
    },
    {
      id: 'ACTIVE',
      title: 'Active Emergencies',
      count: active,
      icon: AlertCircle,
      color: 'red',
      bgLight: 'bg-red-50/70',
      border: 'border-red-200',
      textColor: 'text-red-700',
      iconColor: 'text-red-600',
      ringColor: 'ring-red-500',
      badge: active > 0 ? 'Urgent' : null
    },
    {
      id: 'ACKNOWLEDGED',
      title: 'Acknowledged',
      count: acknowledged,
      icon: Clock,
      color: 'amber',
      bgLight: 'bg-amber-50/70',
      border: 'border-amber-200',
      textColor: 'text-amber-800',
      iconColor: 'text-amber-600',
      ringColor: 'ring-amber-500'
    },
    {
      id: 'IN PROGRESS',
      title: 'In Progress',
      count: inProgress,
      icon: Activity,
      color: 'blue',
      bgLight: 'bg-blue-50/70',
      border: 'border-blue-200',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-600',
      ringColor: 'ring-blue-500'
    },
    {
      id: 'RESOLVED',
      title: 'Resolved',
      count: resolved,
      icon: CheckCircle2,
      color: 'emerald',
      bgLight: 'bg-emerald-50/70',
      border: 'border-emerald-200',
      textColor: 'text-emerald-700',
      iconColor: 'text-emerald-600',
      ringColor: 'ring-emerald-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((c) => {
        const IconComponent = c.icon;
        const isSelected = activeFilter === c.id;

        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelectFilter(c.id)}
            className={`text-left p-4 rounded-xl border transition-all relative cursor-pointer ${c.bgLight} ${c.border} ${
              isSelected ? `ring-2 ${c.ringColor} shadow-md` : 'hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 tracking-tight">
                {c.title}
              </span>
              <IconComponent className={`w-4 h-4 ${c.iconColor}`} />
            </div>

            <div className="flex items-baseline justify-between">
              <span className={`text-2xl sm:text-3xl font-extrabold ${c.textColor}`}>
                {c.count}
              </span>
              {c.badge && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-red-600 text-white animate-pulse">
                  {c.badge}
                </span>
              )}
            </div>

            {isSelected && (
              <span className="absolute bottom-1 right-2 text-[10px] font-bold text-slate-500">
                Filtered
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

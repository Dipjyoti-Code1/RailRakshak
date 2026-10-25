import React from 'react';
import { AlertCircle, Clock, Activity, CheckCircle2, Users } from 'lucide-react';
import { IncidentResponse, IncidentStatus } from '../../types';

interface SummaryProps {
  incidents: IncidentResponse[];
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export const IncidentSummaryCards: React.FC<SummaryProps> = ({
  incidents,
  activeFilter,
  onSelectFilter
}) => {
  const total = incidents.length;
  const active = incidents.filter((i) => i.status === 'ACTIVE').length;
  const acknowledged = incidents.filter((i) => i.status === 'ACKNOWLEDGED').length;
  const inProgress = incidents.filter((i) => i.status === 'IN_PROGRESS').length;
  const resolved = incidents.filter((i) => i.status === 'RESOLVED').length;

  const cards = [
    {
      id: 'ALL',
      title: 'Total Incidents',
      count: total,
      icon: Users,
      bg: 'bg-white',
      border: 'border-slate-300',
      text: 'text-slate-900',
      iconColor: 'text-slate-600'
    },
    {
      id: 'ACTIVE',
      title: 'Active Distress',
      count: active,
      icon: AlertCircle,
      bg: 'bg-red-50',
      border: 'border-red-300',
      text: 'text-red-700',
      iconColor: 'text-red-700',
      badge: active > 0 ? 'Urgent' : undefined
    },
    {
      id: 'ACKNOWLEDGED',
      title: 'Acknowledged',
      count: acknowledged,
      icon: Clock,
      bg: 'bg-harvest-50',
      border: 'border-harvest-300',
      text: 'text-amber-800',
      iconColor: 'text-amber-700'
    },
    {
      id: 'IN_PROGRESS',
      title: 'In Progress',
      count: inProgress,
      icon: Activity,
      bg: 'bg-sky-50',
      border: 'border-sky-300',
      text: 'text-sky-800',
      iconColor: 'text-sky-700'
    },
    {
      id: 'RESOLVED',
      title: 'Resolved',
      count: resolved,
      icon: CheckCircle2,
      bg: 'bg-farm-50',
      border: 'border-farm-300',
      text: 'text-farm-900',
      iconColor: 'text-farm-700'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        const isSelected = activeFilter === c.id;

        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelectFilter(c.id)}
            className={`text-left p-4 sm:p-5 rounded-3xl border transition-all relative cursor-pointer ${c.bg} ${c.border} ${
              isSelected ? 'ring-2 ring-farm-600 shadow-sm' : 'hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">{c.title}</span>
              <Icon className={`w-4 h-4 ${c.iconColor}`} />
            </div>

            <div className="flex items-baseline justify-between">
              <span className={`text-2xl sm:text-3xl font-extrabold ${c.text}`}>{c.count}</span>
              {c.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white shadow-2xs">
                  {c.badge}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

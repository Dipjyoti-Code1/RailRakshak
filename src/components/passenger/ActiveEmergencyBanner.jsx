import React from 'react';
import { AlertCircle, CheckCircle2, Clock, MapPin, Radio, ShieldCheck, ChevronRight, XCircle } from 'lucide-react';
import Badge from '../common/Badge';
import { formatCoordinates, formatDateTime } from '../../utils/formatters';

export default function ActiveEmergencyBanner({ emergency, onDismiss }) {
  if (!emergency) return null;

  const { emergencyId, emergency: meta, location, passenger, journey } = emergency;
  const currentStatus = meta?.status || 'ACTIVE';

  const steps = [
    { key: 'ACTIVE', label: 'Alert Broadcasted', sub: 'Distress signal active' },
    { key: 'ACKNOWLEDGED', label: 'Acknowledged', sub: 'Control room alerted' },
    { key: 'IN PROGRESS', label: 'Assistance Dispatched', sub: 'Response team en route' },
    { key: 'RESOLVED', label: 'Resolved', sub: 'Incident concluded' }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'ACTIVE': return 0;
      case 'ACKNOWLEDGED': return 1;
      case 'IN PROGRESS': return 2;
      case 'RESOLVED': return 3;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(currentStatus);

  return (
    <div className="bg-white rounded-2xl border-2 border-red-500 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Banner Top Header */}
      <div className={`px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-white ${
        currentStatus === 'RESOLVED' ? 'bg-emerald-600' : 'bg-red-600'
      }`}>
        <div className="flex items-center gap-2.5">
          <Radio className="w-5 h-5 text-amber-300 animate-pulse" />
          <span className="font-extrabold text-sm sm:text-base tracking-wide">
            {currentStatus === 'RESOLVED' ? 'Emergency Incident Resolved' : 'Active Emergency Signal Transmitted'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-black/25 px-2.5 py-1 rounded-md font-mono font-bold tracking-wider">
            {emergencyId}
          </span>
          {meta?.isDemo && (
            <span className="text-[10px] bg-amber-400 text-black px-2 py-0.5 rounded font-black">
              DEMO
            </span>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Success / Status Message Notification */}
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
          currentStatus === 'RESOLVED'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : currentStatus === 'IN PROGRESS'
            ? 'bg-blue-50 border-blue-200 text-blue-900'
            : currentStatus === 'ACKNOWLEDGED'
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-red-50 border-red-200 text-red-900'
        }`}>
          <div className="mt-0.5">
            {currentStatus === 'RESOLVED' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <Clock className="w-5 h-5 text-amber-600 animate-spin" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm">
              Emergency alert recorded successfully. Your Emergency ID is <span className="font-mono underline">{emergencyId}</span>.
            </h4>
            <p className="text-xs mt-1 leading-relaxed opacity-90">
              {currentStatus === 'ACTIVE' && 'Waiting for Authority Control Room to acknowledge this transmission. Status updates synchronize automatically across tabs.'}
              {currentStatus === 'ACKNOWLEDGED' && 'The Simulated Railway Control Room has acknowledged your distress signal and is coordinating response.'}
              {currentStatus === 'IN PROGRESS' && 'Railway assistance personnel and security teams are marked in progress.'}
              {currentStatus === 'RESOLVED' && 'This emergency incident has been marked as resolved by the Authority Control Room.'}
            </p>
          </div>
        </div>

        {/* Real-time Status Progression Stepper */}
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Real-Time Response Pipeline
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {steps.map((st, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              let bgClasses = 'bg-slate-50 border-slate-200 text-slate-400';
              if (isPast) {
                bgClasses = 'bg-emerald-50 border-emerald-300 text-emerald-800';
              } else if (isCurrent) {
                bgClasses = currentStatus === 'RESOLVED'
                  ? 'bg-emerald-100 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/30'
                  : currentStatus === 'IN PROGRESS'
                  ? 'bg-blue-100 border-blue-500 text-blue-900 ring-2 ring-blue-500/30'
                  : currentStatus === 'ACKNOWLEDGED'
                  ? 'bg-amber-100 border-amber-500 text-amber-900 ring-2 ring-amber-500/30'
                  : 'bg-red-100 border-red-500 text-red-900 ring-2 ring-red-500/30';
              }

              return (
                <div
                  key={st.key}
                  className={`p-3 rounded-xl border transition-all ${bgClasses}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Step {idx + 1}
                    </span>
                    {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-current animate-ping" />}
                  </div>
                  <div className="font-bold text-xs sm:text-sm line-clamp-1">{st.label}</div>
                  <div className="text-[11px] opacity-80 mt-0.5 line-clamp-1">{st.sub}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Incident Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block mb-0.5">Reported Timestamp</span>
            <span className="font-semibold text-slate-800">
              {formatDateTime(meta?.createdAt)}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block mb-0.5">Train & Journey</span>
            <span className="font-semibold text-slate-800">
              Train {journey?.trainNumber || 'N/A'} ({journey?.boardingStation || '—'} → {journey?.destinationStation || '—'})
            </span>
          </div>

          <div>
            <span className="text-slate-500 block mb-0.5">Reported Location</span>
            <span className="font-mono font-semibold text-slate-800">
              {location?.available ? formatCoordinates(location.latitude, location.longitude) : 'GPS Not Available'}
            </span>
          </div>
        </div>

        {/* Action Button: Clear / Dismiss */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 italic">
            This card automatically updates when the Authority Control Room takes action.
          </span>
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium transition-colors"
          >
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            Dismiss / New Incident
          </button>
        </div>
      </div>
    </div>
  );
}

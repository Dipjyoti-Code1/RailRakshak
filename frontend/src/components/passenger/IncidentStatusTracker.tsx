import React, { useEffect, useState } from 'react';
import { Radio, CheckCircle2, Clock, Activity, ShieldCheck, ChevronRight, RefreshCw } from 'lucide-react';
import { IncidentResponse, IncidentStatus } from '../../types';
import { api } from '../../api/client';

interface TrackerProps {
  incident: IncidentResponse;
  onRefresh?: () => void;
  onUpdate?: (updated: IncidentResponse) => void;
}

export const IncidentStatusTracker: React.FC<TrackerProps> = ({ incident, onRefresh, onUpdate }) => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Poll for updates every 3 seconds
  useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      try {
        const fresh = await api.getIncident(incident.incident_id);
        if (mounted && fresh.status !== incident.status) {
          if (onUpdate) onUpdate(fresh);
          if (onRefresh) onRefresh();
        }
      } catch {
        // ignore polling failures
      }
    };

    const interval = setInterval(checkStatus, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [incident.incident_id, incident.status, onUpdate, onRefresh]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const fresh = await api.getIncident(incident.incident_id);
      if (onUpdate) onUpdate(fresh);
      if (onRefresh) onRefresh();
    } catch {
      // ignore
    } finally {
      setIsRefreshing(false);
    }
  };

  const steps: { key: IncidentStatus; label: string; desc: string }[] = [
    { key: 'ACTIVE', label: 'Distress Transmitted', desc: 'Alert logged in database' },
    { key: 'ACKNOWLEDGED', label: 'Responder Acknowledged', desc: 'Officer / Control Room engaged' },
    { key: 'IN_PROGRESS', label: 'Assistance In Progress', desc: 'Responder on scene assisting' },
    { key: 'RESOLVED', label: 'Incident Concluded', desc: 'Assistance completed' }
  ];

  const getStepIndex = (st: IncidentStatus) => {
    switch (st) {
      case 'ACTIVE': return 0;
      case 'ACKNOWLEDGED': return 1;
      case 'IN_PROGRESS': return 2;
      case 'RESOLVED': return 3;
      default: return 0;
    }
  };

  const currentIdx = getStepIndex(incident.status);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4">
      {/* Top Status Header */}
      <div className={`px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-white ${
        incident.status === 'RESOLVED' ? 'bg-farm-600' : 'bg-slate-900'
      }`}>
        <div className="flex items-center gap-2.5">
          <Radio className="w-4 h-4 text-harvest-400 animate-pulse" />
          <span className="font-bold text-sm">
            {incident.status === 'RESOLVED' ? 'Assistance Concluded' : 'Active Assistance Request'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs bg-white/20 px-2.5 py-1 rounded-lg font-bold text-white">
            {incident.incident_id}
          </span>
          <button
            type="button"
            onClick={handleManualRefresh}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            title="Refresh current status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Real-time Status Card Message */}
        <div className="p-4 rounded-2xl bg-[#F9FBF9] border border-emerald-100 flex items-start gap-3">
          <div className="mt-0.5">
            {incident.status === 'RESOLVED' ? (
              <CheckCircle2 className="w-5 h-5 text-farm-600" />
            ) : incident.status === 'IN_PROGRESS' ? (
              <Activity className="w-5 h-5 text-sky-600 animate-pulse" />
            ) : (
              <Clock className="w-5 h-5 text-harvest-600" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">
              {incident.status === 'ACTIVE' && 'Your assistance request has been transmitted.'}
              {incident.status === 'ACKNOWLEDGED' && 'Responder on duty or Authority Control Room has acknowledged your alert.'}
              {incident.status === 'IN_PROGRESS' && 'Assistance is in progress. An escort officer is on-scene.'}
              {incident.status === 'RESOLVED' && 'This emergency incident has been resolved.'}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Affected Person: <strong className="text-slate-800">{incident.affected_person.full_name}</strong> • Category: <strong className="text-slate-800">{incident.category.replace(/_/g, ' ')}</strong>
            </p>
          </div>
        </div>

        {/* Status Pipeline Progression */}
        <div>
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
            Status Progression
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {steps.map((st, idx) => {
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;

              let style = 'bg-[#F9FBF9] border-slate-300 text-slate-700';
              if (isPast) {
                style = 'bg-farm-50 border-farm-300 text-farm-900 font-semibold';
              } else if (isCurrent) {
                style = incident.status === 'RESOLVED'
                  ? 'bg-farm-50 border-farm-500 text-farm-900 ring-2 ring-farm-500/20 font-bold'
                  : 'bg-harvest-50 border-harvest-400 text-harvest-950 ring-2 ring-harvest-500/20 font-bold';
              }

              return (
                <div key={st.key} className={`p-3.5 rounded-2xl border text-xs transition-all ${style}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Step {idx + 1}</span>
                    {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-farm-600" />}
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-harvest-500 animate-ping" />}
                  </div>
                  <div className="font-bold text-xs leading-snug text-slate-900">{st.label}</div>
                  <div className="text-[10px] text-slate-600 font-medium mt-0.5">{st.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status History Audit */}
        {incident.status_history && incident.status_history.length > 0 && (
          <div className="border-t border-slate-200 pt-3">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Action Timeline
            </span>
            <div className="space-y-1.5 text-xs">
              {incident.status_history.map((h, i) => (
                <div key={i} className="flex items-center justify-between bg-[#F9FBF9] px-3.5 py-2 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{h.to_status}</span>
                    <span className="text-slate-500">by {h.updated_by}</span>
                    {h.notes && <span className="text-[11px] text-slate-600 italic">({h.notes})</span>}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

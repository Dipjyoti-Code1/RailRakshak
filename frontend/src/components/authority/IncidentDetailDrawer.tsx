import React, { useState } from 'react';
import {
  X,
  User,
  Train,
  Clock,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ShieldAlert,
  Send
} from 'lucide-react';
import { IncidentResponse, IncidentStatus } from '../../types';
import { IncidentMap } from '../map/IncidentMap';
import { OfficerMatchingCard } from './OfficerMatchingCard';

interface DetailDrawerProps {
  incident: IncidentResponse | null;
  onClose: () => void;
  onUpdateStatus: (incidentId: string, newStatus: IncidentStatus, notes?: string) => Promise<void>;
}

export const IncidentDetailDrawer: React.FC<DetailDrawerProps> = ({
  incident,
  onClose,
  onUpdateStatus
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState('');

  if (!incident) return null;

  const currentStatus = incident.status;
  const canAcknowledge = currentStatus === 'ACTIVE';
  const canMarkInProgress = currentStatus === 'ACKNOWLEDGED';
  const canResolve = currentStatus !== 'RESOLVED';

  const handleAction = async (targetStatus: IncidentStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(incident.incident_id, targetStatus, notes.trim() || undefined);
      setNotes('');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (st: IncidentStatus) => {
    switch (st) {
      case 'ACTIVE':
        return 'bg-red-100 text-red-800 border-red-300 font-bold';
      case 'ACKNOWLEDGED':
        return 'bg-harvest-100 text-harvest-900 border-harvest-300 font-bold';
      case 'IN_PROGRESS':
        return 'bg-sky-100 text-sky-900 border-sky-300 font-bold';
      case 'RESOLVED':
        return 'bg-farm-100 text-farm-900 border-farm-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300 font-bold';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white min-h-screen shadow-2xl flex flex-col border-l border-slate-200">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white text-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-farm-50 text-farm-700 border border-farm-200">
              <ShieldAlert className="w-5 h-5 text-farm-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-lg text-slate-900">
                  {incident.incident_id}
                </h3>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(currentStatus)}`}>
                  {currentStatus}
                </span>
                {incident.is_demo && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-harvest-100 text-harvest-950 border border-harvest-300">
                    DEMO
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500">
                Reported: {new Date(incident.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Authority Response Action Bar */}
          <div className="bg-[#F9FBF9] border border-emerald-100 rounded-3xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Control Room Response Lifecycle
            </h4>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleAction('ACKNOWLEDGED')}
                disabled={!canAcknowledge || isUpdating}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs ${
                  canAcknowledge
                    ? 'bg-harvest-400 hover:bg-harvest-500 text-slate-950 border border-harvest-500 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Clock className="w-4 h-4" />
                1. Acknowledge Alert
              </button>

              <button
                type="button"
                onClick={() => handleAction('IN_PROGRESS')}
                disabled={!canMarkInProgress || isUpdating}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs ${
                  canMarkInProgress
                    ? 'bg-sky-600 hover:bg-sky-700 text-white cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Activity className="w-4 h-4" />
                2. Mark In Progress
              </button>

              <button
                type="button"
                onClick={() => handleAction('RESOLVED')}
                disabled={!canResolve || isUpdating}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs ${
                  canResolve
                    ? 'bg-farm-600 hover:bg-farm-700 text-white cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                3. Resolve Incident
              </button>
            </div>

            <div className="pt-2">
              <input
                type="text"
                placeholder="Optional operator notes for status change (e.g. RPF escort alerted at Kanpur)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
              />
            </div>
          </div>

          {/* Location Map Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-farm-600" />
              Reported GPS Incident Location
            </h4>
            <IncidentMap
              location={incident.location}
              incidentId={incident.incident_id}
              affectedPersonName={incident.affected_person.full_name}
              trainNumber={incident.journey_snapshot?.train_number}
              isDemo={incident.is_demo}
              height="280px"
            />
          </div>

          {/* Potential Officer Matching Section */}
          <OfficerMatchingCard incidentId={incident.incident_id} />

          {/* Passenger & Emergency Details */}
          <div className="bg-[#F9FBF9] rounded-3xl p-5 border border-emerald-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-emerald-100 pb-2">
              <User className="w-4 h-4 text-farm-600" />
              Passenger & Assistance Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Affected Person</span>
                <span className="font-bold text-slate-900 text-sm">
                  {incident.affected_person.full_name}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Relationship: {incident.affected_person.relationship || 'Self'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Emergency Category</span>
                <span className="font-bold text-red-600 text-sm">{incident.category}</span>
                {incident.affected_person.assistance_needs && (
                  <span className="text-[11px] text-harvest-700 block font-medium">
                    Special Need: {incident.affected_person.assistance_needs}
                  </span>
                )}
              </div>

              {incident.description && (
                <div className="sm:col-span-2 bg-white p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Passenger Description:
                  </span>
                  <p className="text-xs text-slate-900 leading-relaxed italic">
                    "{incident.description}"
                  </p>
                </div>
              )}

              <div>
                <span className="text-slate-500 block mb-0.5">Primary Passenger Mobile</span>
                <span className="font-mono font-semibold text-slate-900">
                  +91 {incident.journey_snapshot?.primary_passenger?.mobile_number || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Emergency Contact</span>
                <span className="font-semibold text-slate-900">
                  {incident.journey_snapshot?.primary_passenger?.emergency_contact_name || 'N/A'}{' '}
                  {incident.journey_snapshot?.primary_passenger?.emergency_contact_mobile && (
                    <span className="font-mono text-slate-500">
                      (+91 {incident.journey_snapshot.primary_passenger.emergency_contact_mobile})
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Journey Information */}
          <div className="bg-[#F9FBF9] rounded-3xl p-5 border border-emerald-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-emerald-100 pb-2">
              <Train className="w-4 h-4 text-farm-600" />
              Journey Information
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Train Number</span>
                <span className="font-mono font-bold text-slate-900">
                  {incident.journey_snapshot?.train_number || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Train Name</span>
                <span className="font-medium text-slate-900">
                  {incident.journey_snapshot?.train_name || '—'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Coach</span>
                <span className="font-mono font-bold text-slate-900">
                  {incident.journey_snapshot?.coach || '—'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Seat</span>
                <span className="font-mono font-bold text-slate-900">
                  {incident.journey_snapshot?.seat || '—'}
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-slate-500 block mb-0.5">Boarding Station</span>
                <span className="font-medium text-slate-900">
                  {incident.journey_snapshot?.boarding_station || 'N/A'}
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-slate-500 block mb-0.5">Destination Station</span>
                <span className="font-medium text-slate-900">
                  {incident.journey_snapshot?.destination_station || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F9FBF9] border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>RailRakshak Central Operational Engine</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};

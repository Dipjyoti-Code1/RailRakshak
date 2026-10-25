import React from 'react';
import {
  X,
  User,
  Train,
  MapPin,
  Clock,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Activity,
  Calendar,
  Compass
} from 'lucide-react';
import Badge from '../common/Badge';
import EmergencyMap from '../map/EmergencyMap';
import { formatCoordinates, formatDateTime } from '../../utils/formatters';

export default function EmergencyDetailsPanel({
  emergency,
  onClose,
  onUpdateStatus
}) {
  if (!emergency) return null;

  const { emergencyId, passenger, journey, location, emergency: meta } = emergency;
  const currentStatus = meta?.status || 'ACTIVE';

  // Check valid actions based on current status
  const canAcknowledge = currentStatus === 'ACTIVE';
  const canMarkInProgress = currentStatus === 'ACKNOWLEDGED';
  const canResolve = currentStatus !== 'RESOLVED';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white min-h-screen shadow-2xl flex flex-col border-l border-slate-200">
        {/* Sticky Top Header */}
        <div className="sticky top-0 z-20 bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600 text-white font-mono font-bold text-sm">
              🚨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-black text-lg tracking-wide text-white">
                  {emergencyId}
                </h3>
                <Badge status={currentStatus} isDemo={meta?.isDemo} size="sm" />
              </div>
              <span className="text-xs text-slate-400">
                Submitted at {formatDateTime(meta?.createdAt)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Record Notice if applicable */}
        {meta?.isDemo && (
          <div className="bg-amber-500 text-slate-950 font-bold px-6 py-2 text-xs flex items-center justify-between">
            <span>⚠ SIMULATED DEMONSTRATION RECORD — Fictional Passenger Data & Coordinates</span>
            <span className="uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-black/20 text-black">
              TEST DATA
            </span>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Authority Action Control Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Railway Authority Response Actions
            </h4>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Action 1: Acknowledge */}
              <button
                type="button"
                onClick={() => onUpdateStatus(emergencyId, 'ACKNOWLEDGED')}
                disabled={!canAcknowledge}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                  canAcknowledge
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer shadow-amber-500/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Clock className="w-4 h-4" />
                1. Acknowledge Alert
              </button>

              {/* Action 2: Mark In Progress */}
              <button
                type="button"
                onClick={() => onUpdateStatus(emergencyId, 'IN PROGRESS')}
                disabled={!canMarkInProgress}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                  canMarkInProgress
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-blue-600/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Activity className="w-4 h-4" />
                2. Mark Assistance In Progress
              </button>

              {/* Action 3: Resolve */}
              <button
                type="button"
                onClick={() => onUpdateStatus(emergencyId, 'RESOLVED')}
                disabled={!canResolve}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                  canResolve
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-emerald-600/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                3. Resolve Emergency
              </button>
            </div>

            <div className="mt-2.5 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Status workflow: ACTIVE → ACKNOWLEDGED → IN PROGRESS → RESOLVED</span>
              <span>Updated: {formatDateTime(meta?.updatedAt)}</span>
            </div>
          </div>

          {/* Map & Location Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-red-600" />
                GPS Incident Location Telemetry
              </h4>
              <span className="text-[11px] font-medium text-slate-500">
                {location?.available ? 'GPS Fix Verified' : 'GPS Unavailable'}
              </span>
            </div>

            <EmergencyMap
              location={location}
              emergencyId={emergencyId}
              passengerName={passenger?.fullName}
              trainNumber={journey?.trainNumber}
              isDemo={meta?.isDemo}
            />
          </div>

          {/* Passenger Information Card */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
              <User className="w-4 h-4 text-blue-600" />
              Passenger Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Passenger Full Name</span>
                <span className="font-bold text-slate-900 text-sm">{passenger?.fullName || 'N/A'}</span>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Age & Gender</span>
                <span className="font-semibold text-slate-800">
                  {passenger?.age ? `${passenger.age} yrs` : 'N/A'} {passenger?.gender ? `(${passenger.gender})` : ''}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Passenger Mobile</span>
                <span className="font-mono font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  +91 {passenger?.mobileNumber || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Emergency Contact</span>
                <span className="font-semibold text-slate-800 block">
                  {passenger?.emergencyContactName || 'N/A'}
                </span>
                <span className="font-mono text-slate-700 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  +91 {passenger?.emergencyContactMobile || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Journey Information Card */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
              <Train className="w-4 h-4 text-emerald-600" />
              Train & Journey Information
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Train Number</span>
                <span className="font-mono font-bold text-slate-900">{journey?.trainNumber || 'N/A'}</span>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Train Name</span>
                <span className="font-medium text-slate-800">{journey?.trainName || '—'}</span>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Coach</span>
                <span className="font-mono font-bold text-slate-800">{journey?.coachNumber || '—'}</span>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Seat / Berth</span>
                <span className="font-mono font-bold text-slate-800">{journey?.seatNumber || '—'}</span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-slate-500 block mb-0.5">Boarding Station</span>
                <span className="font-semibold text-slate-800">{journey?.boardingStation || 'N/A'}</span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-slate-500 block mb-0.5">Destination Station</span>
                <span className="font-semibold text-slate-800">{journey?.destinationStation || 'N/A'}</span>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Journey Date</span>
                <span className="font-medium text-slate-800">{journey?.journeyDate || 'N/A'}</span>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Expected Arrival</span>
                <span className="font-medium text-slate-800">{journey?.expectedArrivalTime || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>RailRakshak Control Room Engine</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}

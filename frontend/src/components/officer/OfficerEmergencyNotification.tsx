import React, { useEffect, useState, useRef } from 'react';
import {
  BellRing,
  AlertTriangle,
  Train,
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Radio,
  ExternalLink,
  ShieldAlert,
  Send,
  Sparkles
} from 'lucide-react';
import { IncidentResponse, IncidentStatus } from '../../types';
import { api } from '../../api/client';
import { IncidentMap } from '../map/IncidentMap';

interface OfficerEmergencyNotificationProps {
  assignedTrain: string;
  onChangeAssignedTrain: (newTrain: string) => void;
  officerName?: string;
}

export const OfficerEmergencyNotification: React.FC<OfficerEmergencyNotificationProps> = ({
  assignedTrain,
  onChangeAssignedTrain,
  officerName = 'RPF Escort Officer'
}) => {
  const [incidents, setIncidents] = useState<IncidentResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionNotes, setActionNotes] = useState<string>('');
  const lastAlertCountRef = useRef<number>(0);

  // Synthesized notification chime via Web Audio API (no external file needed)
  const playAlertChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3); // A4
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const fetchMatchingIncidents = async () => {
    try {
      const all = await api.listIncidents({ limit: 50 });
      // Filter for incidents whose journey train matches the officer's assigned train
      const cleanAssigned = assignedTrain.trim().toLowerCase();
      const matched = all.filter((inc) => {
        const trainNum = inc.journey_snapshot?.train_number?.toLowerCase() || '';
        const trainName = inc.journey_snapshot?.train_name?.toLowerCase() || '';
        return (
          (cleanAssigned && (trainNum.includes(cleanAssigned) || cleanAssigned.includes(trainNum) || trainName.includes(cleanAssigned))) &&
          inc.status !== 'RESOLVED'
        );
      });

      // If a new active incident arrived, trigger notification sound
      const activeCount = matched.filter((i) => i.status === 'ACTIVE').length;
      if (activeCount > lastAlertCountRef.current && activeCount > 0) {
        playAlertChime();
      }
      lastAlertCountRef.current = activeCount;

      setIncidents(matched);
      if (matched.length > 0 && !selectedIncidentId) {
        setSelectedIncidentId(matched[0].incident_id);
      }
    } catch (err) {
      console.error('Failed to poll matching train incidents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchingIncidents();
    const interval = setInterval(fetchMatchingIncidents, 3000);
    return () => clearInterval(interval);
  }, [assignedTrain]);

  const handleUpdateStatus = async (incidentId: string, nextStatus: IncidentStatus) => {
    setUpdatingId(incidentId);
    try {
      await api.updateIncidentStatus(incidentId, {
        status: nextStatus,
        updated_by: `${officerName} (On-Duty RPF)`,
        notes: actionNotes.trim() || `Officer ${officerName} responded on Train ${assignedTrain}`
      });
      setActionNotes('');
      await fetchMatchingIncidents();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Train Assignment & Live Monitor Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-farm-50 text-farm-700 border border-farm-200/80 shadow-2xs">
            <Radio className="w-5 h-5 text-farm-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">
                Train Emergency Dispatch Monitor
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-farm-100 text-farm-800 border border-farm-200">
                Live Radio Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Listening for passenger SOS signals matching your assigned train
            </p>
          </div>
        </div>

        {/* Quick Train Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500">Monitoring Train:</span>
          <button
            type="button"
            onClick={() => onChangeAssignedTrain('12004')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              assignedTrain.includes('12004')
                ? 'bg-farm-600 text-white shadow-2xs'
                : 'bg-[#F9FBF9] text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Train 12004 (Shatabdi)
          </button>
          <button
            type="button"
            onClick={() => onChangeAssignedTrain('12951')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              assignedTrain.includes('12951')
                ? 'bg-farm-600 text-white shadow-2xs'
                : 'bg-[#F9FBF9] text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Train 12951 (Rajdhani)
          </button>
          <input
            type="text"
            placeholder="Custom Train #"
            value={assignedTrain}
            onChange={(e) => onChangeAssignedTrain(e.target.value)}
            className="w-28 px-3 py-1.5 bg-[#F9FBF9] border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
          />
        </div>
      </div>

      {/* When NO incidents are active on this train */}
      {incidents.length === 0 && !loading && (
        <div className="p-4 bg-farm-50/70 border border-farm-200/80 rounded-2xl flex items-center justify-between text-xs text-farm-900">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-farm-600 flex-shrink-0" />
            <span>
              <strong>All Clear on Train #{assignedTrain}:</strong> No active distress calls. You will be notified instantly when a passenger aboard submits an SOS.
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            Auto-polling every 3s
          </span>
        </div>
      )}

      {/* Emergency Distress Cards for Matching Train */}
      {incidents.length > 0 && (
        <div className="space-y-4">
          {incidents.map((incident) => {
            const isSelected = selectedIncidentId === incident.incident_id;
            const isUrgent = incident.status === 'ACTIVE';
            const snap = incident.journey_snapshot;

            return (
              <div
                key={incident.incident_id}
                className={`rounded-3xl border transition-all overflow-hidden ${
                  isUrgent
                    ? 'bg-white border-red-300 shadow-md ring-2 ring-red-500/20'
                    : 'bg-white border-harvest-300 shadow-sm'
                }`}
              >
                {/* Alert Header */}
                <div
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isUrgent ? 'bg-red-600 text-white' : 'bg-harvest-100 text-harvest-950 border-b border-harvest-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center animate-bounce ${
                      isUrgent ? 'bg-white/20 text-white' : 'bg-harvest-200 text-harvest-800'
                    }`}>
                      <BellRing className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm tracking-wide">
                          {isUrgent ? '🚨 LIVE PASSENGER SOS ALERT!' : '⚠️ INCIDENT IN RESPONSE'}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isUrgent ? 'bg-white/20 text-white' : 'bg-harvest-200 text-harvest-950 border border-harvest-300'
                        }`}>
                          {incident.incident_id}
                        </span>
                      </div>
                      <p className={`text-xs ${isUrgent ? 'text-white/90' : 'text-slate-700 font-medium'}`}>
                        Assigned Train #{snap?.train_number || assignedTrain} • {snap?.train_name || 'Passenger Express'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-xl bg-white text-slate-900 shadow-2xs border border-slate-200">
                      Status: {incident.status}
                    </span>
                  </div>
                </div>

                {/* Primary Alert Body: Coach, Seat, Passenger Details */}
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Coach & Seat Highlight Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F9FBF9] p-4 rounded-2xl border border-emerald-100">
                    <div className="sm:border-r border-slate-200 pr-3">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Location on Train
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xl font-extrabold text-red-600">
                          Coach {snap?.coach || 'Unspecified'}
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          • Seat {snap?.seat || 'Unspecified'}
                        </span>
                      </div>
                    </div>

                    <div className="sm:border-r border-slate-200 pr-3">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Affected Individual
                      </span>
                      <div className="mt-1">
                        <span className="font-bold text-sm text-slate-900 block">
                          {incident.affected_person.full_name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Relation: {incident.affected_person.relationship || 'Self'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Emergency Category
                      </span>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                          {incident.category.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Passenger Notes / Description & Special Needs */}
                  <div className="space-y-2 text-xs">
                    {incident.description && (
                      <div className="p-3.5 rounded-2xl bg-farm-50/60 border border-farm-200/80 text-farm-900">
                        <span className="font-bold block mb-0.5">Reported Description / Distress:</span>
                        <p className="text-xs leading-relaxed">{incident.description}</p>
                      </div>
                    )}

                    {incident.affected_person.assistance_needs && (
                      <div className="p-3 rounded-2xl bg-harvest-50/70 border border-harvest-200 text-harvest-900 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-harvest-600 flex-shrink-0" />
                        <span>
                          <strong>Special Care Requirements:</strong>{' '}
                          {incident.affected_person.assistance_needs}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contact & Telemetry Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-4 flex-wrap text-slate-500">
                      {snap?.primary_passenger?.mobile_number && (
                        <div className="flex items-center gap-1 font-mono">
                          <Phone className="w-3.5 h-3.5 text-farm-600" />
                          <span>Pass. Mobile: +91 {snap.primary_passenger.mobile_number}</span>
                        </div>
                      )}

                      {incident.location?.available && (
                        <div className="flex items-center gap-1 font-mono">
                          <MapPin className="w-3.5 h-3.5 text-red-600" />
                          <span>
                            GPS: {incident.location.latitude?.toFixed(4)}°, {incident.location.longitude?.toFixed(4)}°
                          </span>
                        </div>
                      )}

                      {incident.location?.manual_station && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-farm-600" />
                          <span>Station Landmark: {incident.location.manual_station}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(incident.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowMap(!showMap)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-farm-700 hover:underline cursor-pointer"
                    >
                      <span>{showMap ? 'Hide GPS Map' : 'View GPS Map'}</span>
                      {showMap ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Expandable Leaflet Map for Officer */}
                  {showMap && incident.location && (
                    <div className="pt-2">
                      <IncidentMap
                        location={incident.location}
                        incidentId={incident.incident_id}
                        affectedPersonName={incident.affected_person.full_name}
                        trainNumber={snap?.train_number}
                        height="260px"
                      />
                    </div>
                  )}

                  {/* Officer Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex-1 max-w-sm">
                      <input
                        type="text"
                        placeholder="Add responder notes (e.g. Arrived at coach C2)"
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#F9FBF9] border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {incident.status === 'ACTIVE' && (
                        <button
                          type="button"
                          disabled={updatingId === incident.incident_id}
                          onClick={() => handleUpdateStatus(incident.incident_id, 'ACKNOWLEDGED')}
                          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                        >
                          <BellRing className="w-3.5 h-3.5" />
                          <span>Acknowledge SOS (Proceeding)</span>
                        </button>
                      )}

                      {incident.status === 'ACKNOWLEDGED' && (
                        <button
                          type="button"
                          disabled={updatingId === incident.incident_id}
                          onClick={() => handleUpdateStatus(incident.incident_id, 'IN_PROGRESS')}
                          className="px-4 py-2.5 bg-harvest-400 hover:bg-harvest-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs border border-harvest-500 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Mark On-Scene (In Progress)</span>
                        </button>
                      )}

                      {(incident.status === 'ACKNOWLEDGED' || incident.status === 'IN_PROGRESS') && (
                        <button
                          type="button"
                          disabled={updatingId === incident.incident_id}
                          onClick={() => handleUpdateStatus(incident.incident_id, 'RESOLVED')}
                          className="px-4 py-2.5 bg-farm-600 hover:bg-farm-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolve Emergency (Assistance Provided)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

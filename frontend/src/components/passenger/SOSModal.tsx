import React, { useState } from 'react';
import { AlertOctagon, X, User, HeartPulse, ShieldAlert, AlertTriangle, CheckCircle2, MapPin } from 'lucide-react';
import { JourneyResponse, LocationTelemetry, IncidentCategory, IncidentCreate, IncidentResponse } from '../../types';
import { api } from '../../api/client';

interface SOSModalProps {
  journey: JourneyResponse;
  location: LocationTelemetry;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (incident: IncidentResponse) => void;
}

export const SOSModal: React.FC<SOSModalProps> = ({
  journey,
  location,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedPersonId, setSelectedPersonId] = useState<string>('primary');
  const [category, setCategory] = useState<IncidentCategory>('UNWELL');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Build selectable persons list
  const people = [
    {
      id: 'primary',
      name: journey.primary_passenger.full_name,
      role: 'Primary Passenger (Self)',
      assistanceNeeds: 'Self'
    },
    ...journey.group_members.map((m) => ({
      id: m.member_id,
      name: m.full_name,
      role: `${m.relationship}${m.age ? ` (${m.age} yrs)` : ''}`,
      assistanceNeeds: m.assistance_needs || 'None specified'
    }))
  ];

  const selectedPerson = people.find((p) => p.id === selectedPersonId) || people[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: IncidentCreate = {
        journey_id: journey.journey_id,
        affected_person: {
          full_name: selectedPerson.name,
          relationship: selectedPerson.role,
          member_id: selectedPerson.id === 'primary' ? undefined : selectedPerson.id,
          assistance_needs: selectedPerson.assistanceNeeds
        },
        category,
        description: description.trim() || undefined,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy_meters: location.accuracy_meters,
          last_updated_at: location.last_updated_at || new Date().toISOString(),
          available: location.available,
          permission_status: location.permission_status,
          manual_station: location.manual_station
        },
        is_demo: false
      };

      const result = await api.createIncident(payload);
      setIsSubmitting(false);
      onSuccess(result);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Failed to submit emergency alert. Please check your network connection.');
    }
  };

  const categories: { key: IncidentCategory; label: string; desc: string }[] = [
    { key: 'UNWELL', label: 'Unwell / Medical Issue', desc: 'Sudden illness, pain, dizziness, or medical emergency' },
    { key: 'PERSONAL_SAFETY_CONCERN', label: 'Personal Safety Concern', desc: 'Harassment, stalking, or suspicious behavior' },
    { key: 'LOST_OR_SEPARATED', label: 'Lost / Separated Companion', desc: 'Child, senior, or companion separated at station/coach' },
    { key: 'URGENT_ASSISTANCE', label: 'Urgent Operational Assistance', desc: 'Coach equipment fault, luggage distress, or urgent help' },
    { key: 'OTHER', label: 'Other Concern', desc: 'Other assistance requiring railway staff attention' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-red-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20">
              <AlertOctagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                Transmit Emergency SOS Alert
              </h3>
              <p className="text-xs text-white/90">
                Train #{journey.train_number} • Coach {journey.coach || 'N/A'}, Seat {journey.seat || 'N/A'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Affected Person Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
              Who requires assistance?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {people.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPersonId(p.id)}
                  className={`text-left p-3.5 rounded-2xl border text-xs transition-all cursor-pointer ${
                    selectedPersonId === p.id
                      ? 'bg-farm-50 border-farm-600 text-farm-900 font-semibold ring-1 ring-farm-600'
                      : 'bg-[#F9FBF9] border-slate-200 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900">{p.name}</div>
                  <div className="text-[11px] text-slate-600 font-medium">{p.role}</div>
                  {p.assistanceNeeds !== 'None specified' && p.assistanceNeeds !== 'Self' && (
                    <div className="text-[10px] text-harvest-800 mt-0.5 font-semibold">
                      Note: {p.assistanceNeeds}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Assistance Category */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
              Category of Emergency
            </label>
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <label
                  key={cat.key}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                    category === cat.key
                      ? 'bg-farm-50 border-farm-600 text-farm-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="incidentCategory"
                      value={cat.key}
                      checked={category === cat.key}
                      onChange={() => setCategory(cat.key)}
                      className="text-farm-600 focus:ring-farm-600"
                    />
                    <span className="text-slate-900 font-semibold">{cat.label}</span>
                  </div>
                  <span className="text-[11px] text-slate-600 font-medium">{cat.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Short Description (Optional)
            </label>
            <textarea
              rows={2}
              maxLength={500}
              placeholder="e.g. Needs immediate motion sickness medication / lost child near coach B3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
            />
          </div>

          {/* Telemetry Snapshot Preview */}
          <div className="bg-[#F9FBF9] p-3.5 rounded-2xl border border-emerald-100 text-xs text-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-farm-600" />
              <span>
                {location.available && location.latitude != null
                  ? `GPS Telemetry attached (${location.latitude.toFixed(4)}°, ${location.longitude?.toFixed(4)}°)`
                  : location.manual_station
                  ? `Manual station attached: ${location.manual_station}`
                  : 'Location: Coordinates not available (will use train coach & seat)'}
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-800 font-bold">Coach {journey.coach || 'N/A'}, Seat {journey.seat || 'N/A'}</span>
          </div>

          {/* Reassuring Disclaimer */}
          <div className="bg-farm-50/60 p-3 rounded-2xl border border-farm-200/60 text-[11px] text-farm-900">
            <p className="font-semibold mb-0.5 text-farm-950">Prototype Notice:</p>
            This MVP stores your incident directly in the database for control room and officer coordination.
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold rounded-2xl shadow-md shadow-red-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 transform hover:scale-[1.01] active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>Transmitting Alert...</>
              ) : (
                <>
                  <AlertOctagon className="w-4 h-4" />
                  Confirm & Transmit SOS
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

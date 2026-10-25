import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Train,
  User,
  Users,
  AlertOctagon,
  Calendar,
  Clock,
  MapPin,
  Shield,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { JourneyResponse, LocationTelemetry, IncidentResponse } from '../types';
import { LocationPermissionCard } from '../components/passenger/LocationPermissionCard';
import { SOSModal } from '../components/passenger/SOSModal';
import { IncidentStatusTracker } from '../components/passenger/IncidentStatusTracker';
import { api } from '../api/client';

export const PassengerDashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryJourneyId = searchParams.get('journey_id') || localStorage.getItem('railrakshak_active_journey_id');

  const [journey, setJourney] = useState<JourneyResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active Incident state
  const [activeIncident, setActiveIncident] = useState<IncidentResponse | null>(null);
  const [isSOSModalOpen, setIsSOSModalOpen] = useState<boolean>(false);

  // Location Telemetry state
  const [locationTelemetry, setLocationTelemetry] = useState<LocationTelemetry>({
    available: false,
    permission_status: 'prompt',
    latitude: null,
    longitude: null,
    accuracy_meters: null,
    last_updated_at: null,
    manual_station: null
  });

  // Load journey details and existing incidents
  const fetchDashboardData = async (jid: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getJourney(jid);
      setJourney(data);

      // Check if there are incidents for this journey
      const allIncidents = await api.listIncidents({ limit: 50 });
      const related = allIncidents.find((i) => i.journey_id === jid && i.status !== 'RESOLVED') ||
        allIncidents.find((i) => i.journey_id === jid);

      if (related) {
        setActiveIncident(related);
      }
    } catch (err: any) {
      setError(err.message || 'Could not load journey records from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryJourneyId) {
      fetchDashboardData(queryJourneyId);
    } else {
      setLoading(false);
    }
  }, [queryJourneyId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-farm-600 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-900">Loading passenger safety console...</p>
      </div>
    );
  }

  if (!journey || error) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="p-3 bg-farm-50 text-farm-700 rounded-full w-12 h-12 flex items-center justify-center mx-auto border border-farm-200">
          <Train className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Active Journey Found</h2>
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          {error || 'To access your safety dashboard, register your travel details first.'}
        </p>
        <div>
          <Link
            to="/passenger/onboarding"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-farm-600 hover:bg-farm-700 text-white text-xs font-bold rounded-2xl transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register a New Journey</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Welcome Card - Modern Crisp White Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-farm-100 text-farm-800 border border-farm-200">
              Active Trip Console
            </span>
            <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-300 font-bold">
              ID: {journey.journey_id}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Hello, {journey.primary_passenger.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Train <strong className="text-slate-900">{journey.train_number}</strong> {journey.train_name ? `(${journey.train_name})` : ''} • {journey.boarding_station} ➔ {journey.destination_station}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/passenger/onboarding"
            className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition-colors border border-slate-300"
          >
            New Journey
          </Link>
        </div>
      </div>

      {/* Prominent Emergency SOS Assistance Trigger Card */}
      <div className="bg-white rounded-3xl border border-red-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
            <h2 className="font-bold text-base text-slate-900">
              Emergency Passenger Assistance (SOS)
            </h2>
          </div>
          <p className="text-xs text-slate-600 max-w-lg leading-relaxed">
            Need urgent assistance, medical support, security, or separated from a child? Send an instantaneous distress signal with your verified seat and live GPS.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsSOSModalOpen(true)}
          className="z-10 w-full sm:w-auto px-7 py-3.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <AlertOctagon className="w-5 h-5 text-white animate-pulse" />
          <span>REQUEST SOS ASSISTANCE</span>
        </button>
      </div>

      {/* Active Incident Tracker */}
      {activeIncident && (
        <IncidentStatusTracker
          incident={activeIncident}
          onRefresh={() => fetchDashboardData(journey.journey_id)}
        />
      )}

      {/* Journey & Companions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Journey Details */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Train className="w-4 h-4 text-farm-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
              Train & Ticket Information
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-600 font-medium block mb-0.5">Train Number</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {journey.train_number}
              </span>
              {journey.train_name && (
                <span className="text-[11px] text-slate-600 font-medium block truncate">
                  {journey.train_name}
                </span>
              )}
            </div>

            <div>
              <span className="text-slate-600 font-medium block mb-0.5">Coach & Seat</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-harvest-50 border border-harvest-200 text-harvest-900 font-mono font-bold text-xs rounded-xl">
                {journey.coach ? `Coach ${journey.coach}` : 'Coach —'}, Seat {journey.seat || '—'}
              </span>
            </div>

            <div className="col-span-2 bg-[#F9FBF9] p-3 rounded-2xl border border-emerald-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-600 font-medium block uppercase">Route</span>
                <span className="font-semibold text-slate-900 text-xs">
                  {journey.boarding_station} ➔ {journey.destination_station}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-600 font-medium block uppercase">Date</span>
                <span className="font-semibold text-slate-900 text-xs">
                  {journey.journey_date}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Companions / Group Members */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-harvest-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                Registered Travelers ({1 + journey.group_members.length})
              </h3>
            </div>
            <span className="text-[11px] font-bold text-farm-900 bg-farm-100 px-2.5 py-0.5 rounded-full border border-farm-200">
              {journey.traveler_type}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-[#F9FBF9] p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">{journey.primary_passenger.full_name}</span>
                <span className="text-[11px] text-slate-600 font-medium block">
                  Primary • Mobile: +91 {journey.primary_passenger.mobile_number}
                </span>
              </div>
              <span className="text-[10px] font-bold text-farm-900 bg-farm-50 px-2 py-0.5 rounded-md border border-farm-200">
                Lead
              </span>
            </div>

            {journey.group_members.map((m) => (
              <div
                key={m.member_id}
                className="bg-[#F9FBF9] p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-900">{m.full_name}</span>
                  <span className="text-[11px] text-slate-600 font-medium block">
                    {m.relationship} {m.age ? `• ${m.age} yrs` : ''}
                  </span>
                  {m.assistance_needs && m.assistance_needs !== 'None' && (
                    <span className="text-[10px] text-harvest-800 font-bold block mt-0.5">
                      Need: {m.assistance_needs}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-700 font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  Companion
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Location Status Card */}
      <LocationPermissionCard
        location={locationTelemetry}
        onChange={setLocationTelemetry}
      />

      {/* SOS Modal */}
      <SOSModal
        journey={journey}
        location={locationTelemetry}
        isOpen={isSOSModalOpen}
        onClose={() => setIsSOSModalOpen(false)}
        onSuccess={(newIncident) => {
          setIsSOSModalOpen(false);
          setActiveIncident(newIncident);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
};

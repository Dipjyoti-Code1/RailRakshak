import React, { useState } from 'react';
import { Navigation, CheckCircle2, AlertCircle, Compass, RefreshCw, MapPin } from 'lucide-react';
import { LocationTelemetry } from '../../types';

interface LocationCardProps {
  location: LocationTelemetry;
  onChange: (loc: LocationTelemetry) => void;
}

export const LocationPermissionCard: React.FC<LocationCardProps> = ({ location, onChange }) => {
  const [isLocating, setIsLocating] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);

  const requestBrowserLocation = () => {
    if (!navigator.geolocation) {
      onChange({
        ...location,
        available: false,
        permission_status: 'unsupported'
      });
      setShowManualInput(true);
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;
        onChange({
          latitude,
          longitude,
          accuracy_meters: accuracy,
          last_updated_at: new Date().toISOString(),
          available: true,
          permission_status: 'granted',
          manual_station: null
        });
        setShowManualInput(false);
      },
      (err) => {
        setIsLocating(false);
        let status: 'denied' | 'unavailable' = 'unavailable';
        if (err.code === err.PERMISSION_DENIED) {
          status = 'denied';
        }
        onChange({
          latitude: null,
          longitude: null,
          accuracy_meters: null,
          last_updated_at: new Date().toISOString(),
          available: false,
          permission_status: status
        });
        setShowManualInput(true);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleManualStationChange = (val: string) => {
    onChange({
      ...location,
      manual_station: val,
      available: false
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-farm-50 text-farm-700 border border-farm-200/60 shadow-2xs">
            <Navigation className="w-5 h-5 text-farm-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Location Telemetry
            </h3>
            <p className="text-xs text-slate-600">
              Helps responders pinpoint your coach and train segment in an emergency
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {location.available ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-farm-100 text-farm-900 border border-farm-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-farm-700" />
              GPS Fix Acquired
            </span>
          ) : location.permission_status === 'denied' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
              <AlertCircle className="w-3.5 h-3.5" />
              Permission Denied
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
              <Compass className="w-3.5 h-3.5" />
              GPS Not Requested
            </span>
          )}

          <button
            type="button"
            onClick={requestBrowserLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-farm-600 hover:bg-farm-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating ? 'Acquiring...' : 'Get My Location'}
          </button>
        </div>
      </div>

      {/* Real coordinates display */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="bg-[#F9FBF9] p-3 rounded-2xl border border-emerald-100">
          <span className="text-[11px] text-slate-500 block mb-0.5">Permission</span>
          <span className="font-semibold text-slate-900 capitalize">
            {location.permission_status}
          </span>
        </div>

        <div className="bg-[#F9FBF9] p-3 rounded-2xl border border-emerald-100">
          <span className="text-[11px] text-slate-500 block mb-0.5">Latitude</span>
          <span className="font-mono font-semibold text-slate-900">
            {location.available && location.latitude != null ? location.latitude.toFixed(5) : '—'}
          </span>
        </div>

        <div className="bg-[#F9FBF9] p-3 rounded-2xl border border-emerald-100">
          <span className="text-[11px] text-slate-500 block mb-0.5">Longitude</span>
          <span className="font-mono font-semibold text-slate-900">
            {location.available && location.longitude != null ? location.longitude.toFixed(5) : '—'}
          </span>
        </div>

        <div className="bg-[#F9FBF9] p-3 rounded-2xl border border-emerald-100">
          <span className="text-[11px] text-slate-500 block mb-0.5">Accuracy</span>
          <span className="font-semibold text-slate-900">
            {location.available && location.accuracy_meters != null
              ? `±${Math.round(location.accuracy_meters)}m`
              : '—'}
          </span>
        </div>
      </div>

      {/* Fallback Manual Station / Landmark Input */}
      {(!location.available || showManualInput) && (
        <div className="bg-harvest-50 rounded-2xl p-4 border border-harvest-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-harvest-700" />
              Manual Station / Track Landmark Fallback
            </span>
            <span className="text-[11px] text-slate-600 font-medium">
              If GPS is unavailable, enter nearest landmark
            </span>
          </div>
          <input
            type="text"
            placeholder="e.g. Near Ghaziabad Outer / Passed Platform 3 at Aligarh"
            value={location.manual_station || ''}
            onChange={(e) => handleManualStationChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
          />
        </div>
      )}

      <p className="text-[11px] text-slate-600 font-medium">
        * We never fabricate coordinates or claim GPS was granted when unavailable. If GPS is absent, responders rely on train coach/seat and station entries.
      </p>
    </div>
  );
};

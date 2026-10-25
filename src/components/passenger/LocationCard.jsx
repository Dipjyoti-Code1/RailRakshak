import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle2, AlertCircle, RefreshCw, Compass } from 'lucide-react';
import { formatCoordinates, formatDateTime } from '../../utils/formatters';

export default function LocationCard({ locationState, onLocationUpdate }) {
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const requestLocation = () => {
    setErrorMessage(null);

    if (!navigator.geolocation) {
      const errText = 'Geolocation API is not supported by your current browser.';
      setErrorMessage(errText);
      onLocationUpdate({
        available: false,
        permissionStatus: 'unsupported',
        error: errText
      });
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;
        onLocationUpdate({
          latitude,
          longitude,
          accuracyMeters: accuracy,
          lastUpdatedAt: new Date().toISOString(),
          available: true,
          permissionStatus: 'granted',
          error: null
        });
      },
      (err) => {
        setIsLocating(false);
        let msg = 'Failed to acquire location.';
        let permStatus = 'denied';

        switch (err.code) {
          case err.PERMISSION_DENIED:
            msg = 'Location permission was denied. Please allow location access in your browser settings.';
            permStatus = 'denied';
            break;
          case err.POSITION_UNAVAILABLE:
            msg = 'Location information is currently unavailable on this device/network.';
            permStatus = 'unavailable';
            break;
          case err.TIMEOUT:
            msg = 'The location request timed out. Please try again.';
            permStatus = 'timeout';
            break;
          default:
            msg = err.message || 'Unknown location error.';
            permStatus = 'error';
        }

        setErrorMessage(msg);
        onLocationUpdate({
          available: false,
          permissionStatus: permStatus,
          error: msg
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const getStatusBadge = () => {
    if (locationState.available) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Location Acquired
        </span>
      );
    }
    if (locationState.permissionStatus === 'denied') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
          Permission Denied
        </span>
      );
    }
    if (locationState.permissionStatus === 'unavailable' || locationState.permissionStatus === 'timeout') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          Location Unavailable
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
        <Compass className="w-3.5 h-3.5 text-slate-500" />
        Not Requested Yet
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Your Current Location</h3>
            <p className="text-xs text-slate-500">Live GPS telemetry for emergency response</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <button
            type="button"
            onClick={requestLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating ? 'Locating...' : 'Get My Location'}
          </button>
        </div>
      </div>

      {/* Error notification if any */}
      {(errorMessage || locationState.error) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Location Access Alert</p>
            <p className="text-red-700 mt-0.5">{errorMessage || locationState.error}</p>
            <p className="text-[11px] text-red-600 mt-1">
              * Note: You can still submit an SOS emergency even if GPS is unavailable. The alert will clearly state coordinates are absent.
            </p>
          </div>
        </div>
      )}

      {/* Telemetry Display Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">
            Permission
          </span>
          <span className="text-xs font-bold text-slate-800 capitalize">
            {locationState.permissionStatus || 'Pending'}
          </span>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">
            Latitude
          </span>
          <span className="text-xs font-mono font-bold text-slate-800">
            {locationState.available && locationState.latitude != null
              ? locationState.latitude.toFixed(6)
              : '—'}
          </span>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">
            Longitude
          </span>
          <span className="text-xs font-mono font-bold text-slate-800">
            {locationState.available && locationState.longitude != null
              ? locationState.longitude.toFixed(6)
              : '—'}
          </span>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">
            Accuracy (GPS)
          </span>
          <span className="text-xs font-bold text-slate-800">
            {locationState.available && locationState.accuracyMeters != null
              ? `± ${Math.round(locationState.accuracyMeters)} metres`
              : '—'}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          Last Updated:{' '}
          <span className="font-medium text-slate-700">
            {locationState.lastUpdatedAt ? formatDateTime(locationState.lastUpdatedAt) : 'Not updated yet'}
          </span>
        </span>
        <span className="text-slate-400">Browser Geolocation API (WGS84)</span>
      </div>
    </div>
  );
}

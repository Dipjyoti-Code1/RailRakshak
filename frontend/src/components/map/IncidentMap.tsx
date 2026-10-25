import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Navigation, ExternalLink, AlertTriangle, Compass } from 'lucide-react';
import { LocationTelemetry } from '../../types';

interface IncidentMapProps {
  location?: LocationTelemetry;
  incidentId?: string;
  affectedPersonName?: string;
  trainNumber?: string;
  isDemo?: boolean;
  height?: string;
}

export const IncidentMap: React.FC<IncidentMapProps> = ({
  location,
  incidentId,
  affectedPersonName,
  trainNumber,
  isDemo,
  height = '300px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const hasValidCoords =
    location &&
    location.available &&
    typeof location.latitude === 'number' &&
    typeof location.longitude === 'number' &&
    !isNaN(location.latitude) &&
    !isNaN(location.longitude) &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    location.longitude >= -180 &&
    location.longitude <= 180;

  useEffect(() => {
    if (!hasValidCoords || !mapContainerRef.current) {
      return;
    }

    // After hasValidCoords guard, latitude & longitude are guaranteed numbers
    const latitude = location.latitude as number;
    const longitude = location.longitude as number;
    const { accuracy_meters } = location;

    const beaconIcon = L.divIcon({
      className: 'custom-map-beacon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
          <div class="beacon-pulse"></div>
          <div class="beacon-core"></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18]
    });

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 14,
        zoomControl: true,
        attributionControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      const marker = L.marker([latitude, longitude], { icon: beaconIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4; padding: 4px;">
          <div style="font-weight: 700; color: #DC2626; margin-bottom: 4px;">
            ${incidentId || 'Emergency Alert'}
          </div>
          <div><strong>Passenger:</strong> ${affectedPersonName || 'N/A'}</div>
          <div><strong>Train:</strong> ${trainNumber || 'N/A'}</div>
          <div style="margin-top: 4px; font-size: 11px; color: #64748B;">
            GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}
          </div>
          ${isDemo ? '<div style="margin-top: 4px; color: #F59E0B; font-size: 10px; font-weight: 700;">[SIMULATED LOCATION]</div>' : ''}
        </div>
      `);

      let circle: L.Circle | null = null;
      if (accuracy_meters && accuracy_meters > 0) {
        circle = L.circle([latitude, longitude], {
          radius: Math.min(accuracy_meters, 800),
          color: '#DC2626',
          fillColor: '#DC2626',
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: '4, 4'
        }).addTo(map);
      }

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;

      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    } else {
      const map = mapInstanceRef.current;
      map.setView([latitude, longitude], 14);
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
      }
      if (circleRef.current) {
        circleRef.current.setLatLng([latitude, longitude]);
        if (accuracy_meters) {
          circleRef.current.setRadius(Math.min(accuracy_meters, 800));
        }
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
      }
    };
  }, [hasValidCoords, location?.latitude, location?.longitude, incidentId]);

  const openGoogleMaps = () => {
    if (!hasValidCoords) return;
    const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!hasValidCoords) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 text-center shadow-xs">
        <div className="inline-flex p-3 rounded-2xl bg-farm-50 text-farm-600 border border-farm-200/60 mb-3 shadow-2xs">
          <Compass className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-900 text-sm mb-1">
          {location?.manual_station
            ? `Manual Reference: ${location.manual_station}`
            : 'GPS Location Coordinates Unavailable'}
        </h4>
        <p className="text-xs text-slate-600 max-w-sm mx-auto mb-2 font-medium">
          {location?.manual_station
            ? 'The traveler entered a manual station landmark because live GPS was not acquired.'
            : 'The alert was transmitted without satellite coordinates. Incident response should rely on train, coach, and seat records.'}
        </p>
        <span className="inline-flex items-center text-[11px] font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-300">
          Location: {location?.permission_status === 'denied' ? 'Permission Denied' : 'Not Available'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2.5">
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100"
        style={{ height }}
      >
        <div ref={mapContainerRef} className="w-full h-full" />
        {isDemo && (
          <div className="absolute top-2 right-2 z-[400] bg-harvest-400 text-slate-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs border border-harvest-500">
            SIMULATED GPS
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#F9FBF9] border border-emerald-100 rounded-2xl p-3 text-xs">
        <div>
          <span className="text-slate-600 font-medium block text-[11px]">Reported Coords</span>
          <span className="font-mono font-bold text-slate-900">
            {location.latitude?.toFixed(5)}°, {location.longitude?.toFixed(5)}°
          </span>
        </div>

        <div>
          <span className="text-slate-600 font-medium block text-[11px]">Accuracy</span>
          <span className="font-bold text-slate-900">
            {location.accuracy_meters ? `±${Math.round(location.accuracy_meters)} metres` : 'Standard'}
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          <button
            type="button"
            onClick={openGoogleMaps}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-farm-600 hover:bg-farm-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Maps
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, ExternalLink, AlertTriangle } from 'lucide-react';
import { formatCoordinates, formatDateTime } from '../../utils/formatters';

export default function EmergencyMap({ location, emergencyId, passengerName, trainNumber, isDemo }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

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

    const { latitude, longitude, accuracyMeters } = location;

    // Custom Emergency Marker Icon
    const emergencyIcon = L.divIcon({
      className: 'custom-emergency-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
          <div class="sos-pulse-ring"></div>
          <div class="sos-pulse-dot"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });

    // Initialize map if not yet created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 15,
        zoomControl: true,
        attributionControl: true
      });

      // OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Add Emergency Marker
      const marker = L.marker([latitude, longitude], { icon: emergencyIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4; padding: 4px;">
          <div style="font-weight: 700; color: #DC2626; margin-bottom: 4px;">🚨 ${emergencyId}</div>
          <div><strong>Passenger:</strong> ${passengerName || 'N/A'}</div>
          <div><strong>Train:</strong> ${trainNumber || 'N/A'}</div>
          <div style="margin-top: 4px; font-size: 11px; color: #4B5563;">
            Coords: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}
          </div>
          ${isDemo ? '<div style="margin-top: 4px; color: #D97706; font-size: 10px; font-weight: 700;">[SIMULATED DEMO COORDS]</div>' : ''}
        </div>
      `);

      // Add Accuracy Circle if accuracy is provided
      let circle = null;
      if (accuracyMeters && accuracyMeters > 0) {
        circle = L.circle([latitude, longitude], {
          radius: Math.min(accuracyMeters, 1000), // cap display radius to 1km
          color: '#DC2626',
          fillColor: '#EF4444',
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: '4, 4'
        }).addTo(map);
      }

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;

      // Invalidate size after mount in case layout shifted
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    } else {
      // Update existing map position
      const map = mapInstanceRef.current;
      map.setView([latitude, longitude], 15);
      
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
      }
      
      if (circleRef.current) {
        circleRef.current.setLatLng([latitude, longitude]);
        if (accuracyMeters) {
          circleRef.current.setRadius(Math.min(accuracyMeters, 1000));
        }
      }
    }

    return () => {
      // Map cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
      }
    };
  }, [hasValidCoords, location?.latitude, location?.longitude, emergencyId]);

  const openInExternalMaps = () => {
    if (!hasValidCoords) return;
    const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!hasValidCoords) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
        <div className="inline-flex p-3 rounded-full bg-amber-50 border border-amber-200 text-amber-600 mb-3">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h4 className="font-semibold text-slate-800 text-base mb-1">GPS Location Unavailable</h4>
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-3">
          Location coordinates were not received for this emergency alert. The alert was submitted without GPS telemetry.
        </p>
        <span className="inline-flex items-center text-xs font-medium text-slate-500 bg-slate-200 px-2.5 py-1 rounded-md">
          Status: Coordinates Absent
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3">
      {/* Map display */}
      <div className="relative w-full h-[280px] sm:h-[320px] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {isDemo && (
          <div className="absolute top-2 right-2 z-[400] bg-amber-500/90 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
            SIMULATED GPS
          </div>
        )}
      </div>

      {/* Telemetry info row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
        <div>
          <span className="text-slate-500 block">Coordinates</span>
          <span className="font-mono font-semibold text-slate-800">
            {formatCoordinates(location.latitude, location.longitude)}
          </span>
        </div>
        
        <div>
          <span className="text-slate-500 block">GPS Accuracy</span>
          <span className="font-semibold text-slate-800">
            {location.accuracyMeters ? `± ${Math.round(location.accuracyMeters)} metres` : 'Standard'}
          </span>
        </div>

        <div>
          <span className="text-slate-500 block">Reported Timestamp</span>
          <span className="text-slate-700 font-medium">
            {formatDateTime(location.lastUpdatedAt)}
          </span>
        </div>
      </div>

      {/* Action button */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-slate-500 italic">
          * Location represents snapshot captured at time of SOS submission.
        </span>
        <button
          onClick={openInExternalMaps}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open in Maps
        </button>
      </div>
    </div>
  );
}

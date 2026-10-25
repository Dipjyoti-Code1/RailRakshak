/**
 * Formatting helpers for dates, coordinates, and status presentation
 */

export function formatDateTime(isoString) {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch {
    return isoString;
  }
}

export function formatTimeOnly(isoString) {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch {
    return 'N/A';
  }
}

export function formatCoordinates(lat, lng) {
  if (lat == null || lng == null) return 'Not Available';
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(5)}° ${latDir}, ${Math.abs(lng).toFixed(5)}° ${lngDir}`;
}

export function getStatusStyle(status) {
  switch (status) {
    case 'ACTIVE':
      return {
        badgeBg: 'bg-red-500/15',
        badgeText: 'text-red-700',
        badgeBorder: 'border-red-300',
        dot: 'bg-red-600',
        ring: 'ring-red-400',
        label: 'ACTIVE EMERGENCY'
      };
    case 'ACKNOWLEDGED':
      return {
        badgeBg: 'bg-amber-500/15',
        badgeText: 'text-amber-800',
        badgeBorder: 'border-amber-300',
        dot: 'bg-amber-500',
        ring: 'ring-amber-400',
        label: 'ACKNOWLEDGED'
      };
    case 'IN PROGRESS':
      return {
        badgeBg: 'bg-blue-500/15',
        badgeText: 'text-blue-700',
        badgeBorder: 'border-blue-300',
        dot: 'bg-blue-600',
        ring: 'ring-blue-400',
        label: 'ASSISTANCE IN PROGRESS'
      };
    case 'RESOLVED':
      return {
        badgeBg: 'bg-emerald-500/15',
        badgeText: 'text-emerald-700',
        badgeBorder: 'border-emerald-300',
        dot: 'bg-emerald-600',
        ring: 'ring-emerald-400',
        label: 'RESOLVED'
      };
    default:
      return {
        badgeBg: 'bg-gray-100',
        badgeText: 'text-gray-700',
        badgeBorder: 'border-gray-200',
        dot: 'bg-gray-400',
        ring: 'ring-gray-300',
        label: status || 'UNKNOWN'
      };
  }
}

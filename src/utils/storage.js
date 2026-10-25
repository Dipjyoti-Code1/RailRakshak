/**
 * Storage Utility for RailRakshak
 * Manages localStorage persistence and multi-tab synchronization
 */

export const STORAGE_KEY_EMERGENCIES = 'railrakshak_emergencies_v1';
export const STORAGE_KEY_CURRENT_PASSENGER = 'railrakshak_active_passenger_v1';
export const STORAGE_KEY_LAST_EMERGENCY_ID = 'railrakshak_last_emergency_id_v1';

// Custom event name for same-window updates
export const SYNC_EVENT_NAME = 'railrakshak_sync_event';

/**
 * Generate a sequential unique Emergency ID
 * Format: RR-2026-0001
 */
export function generateEmergencyId() {
  const currentYear = new Date().getFullYear();
  const emergencies = getEmergencies();
  
  // Find highest number from existing IDs
  let maxNum = 0;
  for (const item of emergencies) {
    if (item.emergencyId) {
      const match = item.emergencyId.match(/RR-(\d{4})-(\d+)/);
      if (match && parseInt(match[2], 10) > maxNum) {
        maxNum = parseInt(match[2], 10);
      }
    }
  }
  
  const nextNum = maxNum + 1;
  const paddedNum = String(nextNum).padStart(4, '0');
  return `RR-${currentYear}-${paddedNum}`;
}

/**
 * Retrieve all saved emergencies
 */
export function getEmergencies() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EMERGENCIES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading emergencies from localStorage:', err);
    return [];
  }
}

/**
 * Save all emergencies array to localStorage and notify listeners
 */
export function saveAllEmergencies(emergencies) {
  try {
    localStorage.setItem(STORAGE_KEY_EMERGENCIES, JSON.stringify(emergencies));
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME, { detail: { timestamp: Date.now() } }));
  } catch (err) {
    console.error('Error saving emergencies to localStorage:', err);
  }
}

/**
 * Save a new emergency alert
 */
export function saveEmergency(record) {
  const emergencies = getEmergencies();
  // Check if already exists (prevent duplicate)
  const existingIndex = emergencies.findIndex(e => e.emergencyId === record.emergencyId);
  let updatedList;
  if (existingIndex >= 0) {
    updatedList = [...emergencies];
    updatedList[existingIndex] = record;
  } else {
    // Newest first
    updatedList = [record, ...emergencies];
  }
  saveAllEmergencies(updatedList);
  return record;
}

/**
 * Get an emergency by ID
 */
export function getEmergencyById(id) {
  const emergencies = getEmergencies();
  return emergencies.find(e => e.emergencyId === id) || null;
}

/**
 * Update emergency status with transition guard
 * Valid transitions:
 * ACTIVE -> ACKNOWLEDGED -> IN PROGRESS -> RESOLVED
 * (Also allows direct ACTIVE -> RESOLVED if resolved directly)
 */
export const VALID_STATUS_TRANSITIONS = {
  ACTIVE: ['ACKNOWLEDGED', 'RESOLVED'],
  ACKNOWLEDGED: ['IN PROGRESS', 'RESOLVED'],
  'IN PROGRESS': ['RESOLVED'],
  RESOLVED: [] // Final state
};

export function updateEmergencyStatus(emergencyId, newStatus) {
  const emergencies = getEmergencies();
  const index = emergencies.findIndex(e => e.emergencyId === emergencyId);
  
  if (index === 0 || index > 0) {
    const currentRecord = emergencies[index];
    const currentStatus = currentRecord.emergency.status;

    // Transition check
    const allowed = VALID_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      console.warn(`Invalid transition from ${currentStatus} to ${newStatus}`);
      return { success: false, error: `Invalid transition from ${currentStatus} to ${newStatus}` };
    }

    const updatedRecord = {
      ...currentRecord,
      emergency: {
        ...currentRecord.emergency,
        status: newStatus,
        updatedAt: new Date().toISOString()
      }
    };

    emergencies[index] = updatedRecord;
    saveAllEmergencies(emergencies);
    return { success: true, record: updatedRecord };
  }
  
  return { success: false, error: 'Emergency record not found' };
}

/**
 * Generate a realistic Demo Emergency Record
 * Clearly labeled as fictional and demo
 */
export function createDemoEmergencyRecord() {
  const demoId = generateEmergencyId();
  const now = new Date().toISOString();
  
  // Fictional sample locations on Indian Railways route
  const demoLocations = [
    {
      station: 'New Delhi Railway Station (NDLS)',
      trainNumber: '12004',
      trainName: 'Lucknow Shatabdi Express',
      boarding: 'New Delhi (NDLS)',
      destination: 'Lucknow Charbagh (LKO)',
      coach: 'C-4',
      seat: '28',
      lat: 28.6431,
      lng: 77.2197,
      accuracy: 12
    },
    {
      station: 'Kanpur Central (CNB)',
      trainNumber: '12302',
      trainName: 'Howrah Rajdhani Express',
      boarding: 'New Delhi (NDLS)',
      destination: 'Howrah Jn (HWH)',
      coach: 'B-3',
      seat: '45',
      lat: 26.4538,
      lng: 80.3512,
      accuracy: 18
    },
    {
      station: 'Chhatrapati Shivaji Maharaj Terminus (CSMT)',
      trainNumber: '12138',
      trainName: 'Punjab Mail',
      boarding: 'Firozpur Cantt (FZR)',
      destination: 'Mumbai CSMT (CSMT)',
      coach: 'S-7',
      seat: '19',
      lat: 18.9401,
      lng: 72.8353,
      accuracy: 25
    }
  ];

  // Pick random or first demo scenario
  const scenario = demoLocations[Math.floor(Math.random() * demoLocations.length)];

  return {
    emergencyId: demoId,
    passenger: {
      fullName: 'Rahul S. Verma (SIMULATED)',
      age: 29,
      gender: 'Male',
      mobileNumber: '9876543210',
      emergencyContactName: 'Priya Verma (Sister)',
      emergencyContactMobile: '9876543211'
    },
    journey: {
      trainNumber: scenario.trainNumber,
      trainName: scenario.trainName,
      boardingStation: scenario.boarding,
      destinationStation: scenario.destination,
      coachNumber: scenario.coach,
      seatNumber: scenario.seat,
      journeyDate: new Date().toISOString().split('T')[0],
      expectedArrivalTime: '21:30'
    },
    location: {
      latitude: scenario.lat,
      longitude: scenario.lng,
      accuracyMeters: scenario.accuracy,
      lastUpdatedAt: now,
      available: true
    },
    emergency: {
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      isDemo: true // EXPLICITLY MARKED AS DEMO
    }
  };
}

/**
 * Save / retrieve active passenger session data from localStorage
 * Keeps form state intact if page is reloaded
 */
export function getPassengerSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_PASSENGER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function savePassengerSession(data) {
  try {
    localStorage.setItem(STORAGE_KEY_CURRENT_PASSENGER, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save passenger session', e);
  }
}

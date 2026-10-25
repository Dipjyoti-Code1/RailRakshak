import React, { useState, useEffect } from 'react';
import { Shield, Train, MapPin, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import PassengerForm from '../components/passenger/PassengerForm';
import JourneyForm from '../components/passenger/JourneyForm';
import LocationCard from '../components/passenger/LocationCard';
import SOSButton from '../components/passenger/SOSButton';
import ActiveEmergencyBanner from '../components/passenger/ActiveEmergencyBanner';
import { validatePassengerForm, validateJourneyForm } from '../utils/validation';
import {
  generateEmergencyId,
  saveEmergency,
  getEmergencies,
  SYNC_EVENT_NAME,
  getPassengerSession,
  savePassengerSession,
  STORAGE_KEY_CURRENT_PASSENGER,
  STORAGE_KEY_LAST_EMERGENCY_ID
} from '../utils/storage';

export default function PassengerPage() {
  // Passenger info state
  const [passengerData, setPassengerData] = useState(() => {
    const saved = getPassengerSession();
    return saved?.passenger || {
      fullName: '',
      age: '',
      gender: '',
      mobileNumber: '',
      emergencyContactName: '',
      emergencyContactMobile: ''
    };
  });

  // Journey info state
  const [journeyData, setJourneyData] = useState(() => {
    const saved = getPassengerSession();
    return saved?.journey || {
      trainNumber: '',
      trainName: '',
      boardingStation: '',
      destinationStation: '',
      coachNumber: '',
      seatNumber: '',
      journeyDate: new Date().toISOString().split('T')[0],
      expectedArrivalTime: ''
    };
  });

  // Location telemetry state
  const [locationState, setLocationState] = useState({
    latitude: null,
    longitude: null,
    accuracyMeters: null,
    lastUpdatedAt: null,
    available: false,
    permissionStatus: 'prompt', // prompt, granted, denied, unavailable
    error: null
  });

  // Validation errors
  const [passengerErrors, setPassengerErrors] = useState({});
  const [journeyErrors, setJourneyErrors] = useState({});
  const [submitNotification, setSubmitNotification] = useState(null);

  // Active Emergency tracking
  const [activeEmergencyId, setActiveEmergencyId] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_LAST_EMERGENCY_ID) || null;
  });

  const [activeEmergency, setActiveEmergency] = useState(null);

  // Sync active emergency from storage whenever storage changes or on mount
  const syncCurrentEmergency = () => {
    const lastId = localStorage.getItem(STORAGE_KEY_LAST_EMERGENCY_ID);
    if (lastId) {
      setActiveEmergencyId(lastId);
      const all = getEmergencies();
      const found = all.find((e) => e.emergencyId === lastId);
      setActiveEmergency(found || null);
    } else {
      setActiveEmergency(null);
    }
  };

  useEffect(() => {
    syncCurrentEmergency();

    // Listen to localStorage storage events across tabs
    const handleStorageEvent = (e) => {
      syncCurrentEmergency();
    };

    // Listen to custom same-window events
    const handleCustomSync = () => {
      syncCurrentEmergency();
    };

    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener(SYNC_EVENT_NAME, handleCustomSync);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener(SYNC_EVENT_NAME, handleCustomSync);
    };
  }, []);

  // Save session state to localStorage on changes
  useEffect(() => {
    savePassengerSession({
      passenger: passengerData,
      journey: journeyData
    });
  }, [passengerData, journeyData]);

  // Handle filling sample passenger info for convenient demonstration
  const handleFillSample = () => {
    setPassengerData({
      fullName: 'Rahul Sharma',
      age: 28,
      gender: 'Male',
      mobileNumber: '9876543210',
      emergencyContactName: 'Pooja Sharma (Wife)',
      emergencyContactMobile: '9876543211'
    });
    setJourneyData({
      trainNumber: '12004',
      trainName: 'Lucknow Shatabdi Express',
      boardingStation: 'New Delhi (NDLS)',
      destinationStation: 'Kanpur Central (CNB)',
      coachNumber: 'C-3',
      seatNumber: '42',
      journeyDate: new Date().toISOString().split('T')[0],
      expectedArrivalTime: '11:45'
    });
    setPassengerErrors({});
    setJourneyErrors({});
  };

  // Trigger SOS Emergency
  const handleTriggerSOS = () => {
    // 1. Validate required passenger information
    const passValidation = validatePassengerForm(passengerData);
    setPassengerErrors(passValidation.errors);

    // 2. Validate required journey information
    const jourValidation = validateJourneyForm(journeyData);
    setJourneyErrors(jourValidation.errors);

    if (!passValidation.isValid || !jourValidation.isValid) {
      setSubmitNotification({
        type: 'error',
        message: 'Please complete all required fields highlighted in red before sending an SOS.'
      });
      // Scroll to top of forms
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    // 3. Check GPS coordinate acquisition
    // If not already acquired, request now or fallback
    const proceedWithSave = (finalLocation) => {
      const newEmergencyId = generateEmergencyId();
      const nowIso = new Date().toISOString();

      const newRecord = {
        emergencyId: newEmergencyId,
        passenger: {
          fullName: passengerData.fullName.trim(),
          age: Number(passengerData.age),
          gender: passengerData.gender || null,
          mobileNumber: passengerData.mobileNumber.trim(),
          emergencyContactName: passengerData.emergencyContactName.trim(),
          emergencyContactMobile: passengerData.emergencyContactMobile.trim()
        },
        journey: {
          trainNumber: journeyData.trainNumber.trim(),
          trainName: journeyData.trainName.trim() || '',
          boardingStation: journeyData.boardingStation.trim(),
          destinationStation: journeyData.destinationStation.trim(),
          coachNumber: journeyData.coachNumber.trim() || '',
          seatNumber: journeyData.seatNumber.trim() || '',
          journeyDate: journeyData.journeyDate,
          expectedArrivalTime: journeyData.expectedArrivalTime || ''
        },
        location: {
          latitude: finalLocation.latitude,
          longitude: finalLocation.longitude,
          accuracyMeters: finalLocation.accuracyMeters,
          lastUpdatedAt: finalLocation.lastUpdatedAt || nowIso,
          available: finalLocation.available
        },
        emergency: {
          status: 'ACTIVE',
          createdAt: nowIso,
          updatedAt: nowIso,
          isDemo: false
        }
      };

      // Save emergency record
      saveEmergency(newRecord);
      localStorage.setItem(STORAGE_KEY_LAST_EMERGENCY_ID, newEmergencyId);
      setActiveEmergencyId(newEmergencyId);
      setActiveEmergency(newRecord);

      setSubmitNotification({
        type: 'success',
        message: `Emergency alert submitted successfully. Your Emergency ID is ${newEmergencyId}.`
      });

      // Scroll to active banner
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    };

    // If location is already available, proceed directly
    if (locationState.available && locationState.latitude != null) {
      proceedWithSave(locationState);
    } else if (navigator.geolocation) {
      // Try to acquire location quickly (with 4s timeout)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const freshLoc = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracyMeters: pos.coords.accuracy,
            lastUpdatedAt: new Date().toISOString(),
            available: true,
            permissionStatus: 'granted'
          };
          setLocationState(freshLoc);
          proceedWithSave(freshLoc);
        },
        (err) => {
          // If denied or timed out, allow submission without coordinates
          const fallbackLoc = {
            latitude: null,
            longitude: null,
            accuracyMeters: null,
            lastUpdatedAt: new Date().toISOString(),
            available: false,
            permissionStatus: err.code === 1 ? 'denied' : 'unavailable'
          };
          setLocationState(fallbackLoc);
          proceedWithSave(fallbackLoc);
        },
        { enableHighAccuracy: true, timeout: 4000, maximumAge: 0 }
      );
    } else {
      // Geolocation not supported, submit without coordinates
      proceedWithSave({
        latitude: null,
        longitude: null,
        accuracyMeters: null,
        lastUpdatedAt: new Date().toISOString(),
        available: false,
        permissionStatus: 'unsupported'
      });
    }
  };

  const handleDismissActive = () => {
    localStorage.removeItem(STORAGE_KEY_LAST_EMERGENCY_ID);
    setActiveEmergencyId(null);
    setActiveEmergency(null);
    setSubmitNotification(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner / Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-red-600 text-white text-xs font-black uppercase tracking-wider">
                Passenger Portal
              </span>
              <span className="text-slate-400 text-xs">Indian Railways Safety Prototype</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              RailRakshak Safety Console
            </h1>
            <p className="text-sm text-slate-300">
              Your Journey. Your Safety. Register your trip and transmit instant SOS beacons when in distress.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              type="button"
              onClick={handleFillSample}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              title="Quickly fill sample passenger & journey inputs for demonstration"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fill Demo Details</span>
            </button>
          </div>
        </div>

        {/* Active Emergency Status Banner (if an SOS was triggered) */}
        {activeEmergency && (
          <ActiveEmergencyBanner
            emergency={activeEmergency}
            onDismiss={handleDismissActive}
          />
        )}

        {/* Submit notification message */}
        {submitNotification && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm font-medium ${
              submitNotification.type === 'error'
                ? 'bg-red-50 border-red-300 text-red-800'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {submitNotification.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              )}
              <span>{submitNotification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setSubmitNotification(null)}
              className="text-slate-400 hover:text-slate-700 font-bold px-2 py-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* SOS Button Block */}
        <div className="space-y-2">
          <SOSButton onTriggerSOS={handleTriggerSOS} />
          <p className="text-center text-xs text-slate-500">
            * In case of threat, medical emergency, or security hazard aboard your train, press the SOS button.
          </p>
        </div>

        {/* Form Sections */}
        <div className="space-y-6">
          {/* Passenger Information */}
          <PassengerForm
            data={passengerData}
            onChange={setPassengerData}
            errors={passengerErrors}
          />

          {/* Journey Information */}
          <JourneyForm
            data={journeyData}
            onChange={setJourneyData}
            errors={journeyErrors}
          />

          {/* Location Status Card */}
          <LocationCard
            locationState={locationState}
            onLocationUpdate={setLocationState}
          />
        </div>
      </div>
    </div>
  );
}

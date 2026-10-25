import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Train, AlertCircle, ArrowLeft, User, Users, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import {
  JourneyRegistrationForm,
  DEMO_SOLO_PROFILE,
  DEMO_FAMILY_PROFILE
} from '../components/passenger/JourneyRegistrationForm';
import { JourneyCreate } from '../types';
import { api } from '../api/client';

export const PassengerOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [prefillData, setPrefillData] = useState<JourneyCreate | null>(null);
  const [activeJourneyId, setActiveJourneyId] = useState<string | null>(null);

  useEffect(() => {
    const existing = localStorage.getItem('railrakshak_active_journey_id');
    if (existing) {
      setActiveJourneyId(existing);
    }
  }, []);

  const handleSubmit = async (data: JourneyCreate) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const journey = await api.createJourney(data);
      // Persist active journey ID and details to localStorage
      localStorage.setItem('railrakshak_active_journey_id', journey.journey_id);
      localStorage.setItem('railrakshak_active_journey_data', JSON.stringify(journey));
      // Remove uncommitted draft once journey is safely registered
      localStorage.removeItem('railrakshak_journey_draft');
      navigate(`/passenger/dashboard?journey_id=${encodeURIComponent(journey.journey_id)}`);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Failed to register journey. Please verify input details.');
    }
  };

  const handleInstantDemoStart = async (profile: JourneyCreate) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const journey = await api.createJourney(profile);
      localStorage.setItem('railrakshak_active_journey_id', journey.journey_id);
      localStorage.setItem('railrakshak_active_journey_data', JSON.stringify(journey));
      localStorage.removeItem('railrakshak_journey_draft');
      navigate(`/passenger/dashboard?journey_id=${encodeURIComponent(journey.journey_id)}`);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Could not start demo journey. Please try manual submission.');
    }
  };

  const handleClearActiveJourney = () => {
    localStorage.removeItem('railrakshak_active_journey_id');
    localStorage.removeItem('railrakshak_active_journey_data');
    localStorage.removeItem('railrakshak_journey_draft');
    setActiveJourneyId(null);
    setPrefillData(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        {activeJourneyId && (
          <Link
            to={`/passenger/dashboard?journey_id=${encodeURIComponent(activeJourneyId)}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-farm-600 text-white text-xs font-semibold rounded-2xl shadow-sm hover:bg-farm-700 transition-colors"
          >
            <Train className="w-3.5 h-3.5 text-harvest-300" />
            <span>Go to Active Journey Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Active Journey Banner if user previously created one */}
      {activeJourneyId && (
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-farm-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-farm-900">
                Active Registered Journey Found ({activeJourneyId})
              </p>
              <p className="text-[11px] text-farm-700">
                Your travel session is saved in this browser. You can return to your active safety dashboard anytime.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/passenger/dashboard?journey_id=${encodeURIComponent(activeJourneyId)}`}
              className="px-3.5 py-1.5 bg-farm-600 text-white text-xs font-bold rounded-xl hover:bg-farm-700 shadow-2xs"
            >
              Open Dashboard
            </Link>
            <button
              type="button"
              onClick={handleClearActiveJourney}
              className="px-3 py-1.5 bg-white border border-emerald-200 text-red-600 hover:bg-red-50 text-xs font-medium rounded-xl cursor-pointer"
            >
              Start New Journey
            </button>
          </div>
        </div>
      )}

      {/* Quick Demo Auth / Profiles Header */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-harvest-50 text-harvest-600 border border-harvest-200 flex items-center justify-center font-bold shadow-2xs">
              <Sparkles className="w-5 h-5 text-harvest-500" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-slate-900">
                Quick Demo Passenger Access
              </h2>
              <p className="text-xs text-slate-600">
                Select a demo profile to test immediately with 1 click, or customize details in the form below.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Profile 1: Solo Traveler - Farm Emerald Themed */}
          <div className="p-5 rounded-2xl bg-farm-50/40 border border-farm-200/80 hover:border-farm-300 transition-all space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-farm-200 text-farm-700 flex items-center justify-center shadow-2xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                    Rajesh Sharma (Solo)
                  </h4>
                  <span className="text-[11px] text-slate-600 font-medium">
                    Age 29 • Mobile: 9876543210
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-farm-100 text-farm-800 border border-farm-200">
                Solo Demo
              </span>
            </div>

            <div className="text-[11px] text-slate-700 space-y-0.5 bg-white p-3 rounded-xl border border-farm-100">
              <div><strong>Train:</strong> 12951 — Mumbai Tejas Rajdhani</div>
              <div><strong>Route:</strong> New Delhi (NDLS) → Mumbai Central (BCT)</div>
              <div><strong>Coach & Seat:</strong> Coach B3, Seat 42</div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleInstantDemoStart(DEMO_SOLO_PROFILE)}
                className="flex-1 py-2 px-3 bg-farm-600 hover:bg-farm-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer text-center disabled:opacity-60"
              >
                {isLoading ? 'Starting...' : '🚀 Start as Rajesh'}
              </button>
              <button
                type="button"
                onClick={() => setPrefillData({ ...DEMO_SOLO_PROFILE })}
                className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium rounded-xl transition-colors cursor-pointer"
              >
                Edit in Form
              </button>
            </div>
          </div>

          {/* Profile 2: Family Lead - Warm Harvest Amber Themed */}
          <div className="p-5 rounded-2xl bg-harvest-50/50 border border-harvest-200/80 hover:border-harvest-300 transition-all space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-harvest-200 text-harvest-600 flex items-center justify-center shadow-2xs">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                    Priya Patel (Family Lead)
                  </h4>
                  <span className="text-[11px] text-slate-600 font-medium">
                    Lead + 2 Companions (Child & Senior)
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-harvest-100 text-harvest-900 border border-harvest-300">
                Family Demo
              </span>
            </div>

            <div className="text-[11px] text-slate-700 space-y-0.5 bg-white p-3 rounded-xl border border-harvest-100">
              <div><strong>Train:</strong> 12004 — Lucknow Shatabdi</div>
              <div><strong>Route:</strong> New Delhi (NDLS) → Lucknow (LKO)</div>
              <div><strong>Companions:</strong> Aarav (Son, 7) & Shanti (Senior, 68)</div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleInstantDemoStart(DEMO_FAMILY_PROFILE)}
                className="flex-1 py-2 px-3 bg-harvest-400 hover:bg-harvest-500 text-slate-950 font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer text-center disabled:opacity-60 border border-harvest-500"
              >
                {isLoading ? 'Starting...' : '🚀 Start as Priya & Family'}
              </button>
              <button
                type="button"
                onClick={() => setPrefillData({ ...DEMO_FAMILY_PROFILE })}
                className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Edit in Form
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Full Registration Form with draft persistence */}
      <JourneyRegistrationForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        prefillData={prefillData}
      />
    </div>
  );
};

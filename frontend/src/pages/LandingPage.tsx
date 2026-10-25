import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Train,
  HeartPulse,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  Clock,
  MapPin,
  LifeBuoy
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const activeJourneyId = localStorage.getItem('railrakshak_active_journey_id');

  return (
    <div className="space-y-14 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Demonstration Alert Banner */}
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 text-farm-700">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-medium leading-relaxed text-slate-800">
            <strong className="text-farm-700">Demonstration Prototype:</strong> RailRakshak is an evaluation prototype for railway passenger safety. It is not connected to active Indian Railways emergency dispatchers.
          </span>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-farm-100 text-farm-800 border border-farm-300 shadow-2xs flex-shrink-0">
          MVP Demo
        </span>
      </div>

      {/* Hero Section */}
      <div className="text-center space-y-5 max-w-3xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-harvest-500 animate-pulse"></span>
          <span className="text-farm-700 font-bold">RailRakshak</span>
          <span className="text-emerald-500">•</span>
          <span className="text-slate-700">Next-Generation Railway Passenger Safety</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Your Journey.{' '}
          <span className="text-farm-600">
            Your Safety.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          RailRakshak connects train passengers with railway safety authorities through instant distress alerts, verified coach telemetry, and real-time response monitoring.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <Link
            to="/passenger/onboarding"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-farm-600 hover:bg-farm-700 active:bg-farm-800 text-white font-bold text-sm shadow-md shadow-farm-700/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Train className="w-4 h-4 text-harvest-300" />
            <span>Protect My Journey</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {activeJourneyId ? (
            <Link
              to={`/passenger/dashboard?journey_id=${encodeURIComponent(activeJourneyId)}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 font-bold text-sm shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Resume Active Journey</span>
            </Link>
          ) : (
            <Link
              to="/passenger/onboarding"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 font-semibold text-sm shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-harvest-500" />
              <span>Explore Demo Passenger Profiles</span>
            </Link>
          )}
        </div>
      </div>

      {/* How It Works Grid — FarmCycle 3-Step Design */}
      <div className="pt-4">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            How RailRakshak Passenger Assistance Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Simple 3-step distress workflow engineered for high-pressure transit situations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all space-y-4 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-harvest-100 to-amber-200/80 text-amber-800 flex items-center justify-center shadow-xs">
                <Train className="w-6 h-6 text-amber-700" />
              </div>
              <span className="text-3xl font-mono font-black text-slate-400 group-hover:text-amber-500 transition-colors">
                01
              </span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 group-hover:text-farm-700 transition-colors">
              Register Journey & Companions
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Enter your train number, coach, seat, and group members. Flag companions who need specific mobility, elderly, or infant care assistance.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:border-red-300 hover:shadow-md transition-all space-y-4 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-100 to-rose-200/80 text-red-700 flex items-center justify-center shadow-xs">
                <LifeBuoy className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-3xl font-mono font-black text-slate-400 group-hover:text-red-500 transition-colors">
                02
              </span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 group-hover:text-red-700 transition-colors">
              Instant SOS Distress Transmission
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              In an emergency, tap the prominent SOS button. Select the affected individual, categorize the emergency, and transmit live GPS coordinates.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:border-farm-300 hover:shadow-md transition-all space-y-4 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-farm-100 to-emerald-200/80 text-farm-800 flex items-center justify-center shadow-xs">
                <Shield className="w-6 h-6 text-farm-700" />
              </div>
              <span className="text-3xl font-mono font-black text-slate-400 group-hover:text-farm-600 transition-colors">
                03
              </span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 group-hover:text-farm-700 transition-colors">
              Coordinated Authority Response
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The Authority Control Room tracks the incident on Leaflet maps, inspects coach details, and matches nearby on-duty RPF officers in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-harvest-50 border border-harvest-200 text-xs font-bold text-harvest-800">
              <HeartPulse className="w-3.5 h-3.5 text-harvest-600" />
              <span>Calm, Eye-Friendly Experience</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Safety Without Panic
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Designed with a soothing, bright white background and clean contrast typography, RailRakshak avoids flashing sirens or frightening messages. It focuses on clarity, rapid telemetry capture, and steady reassurance for travelers and families.
            </p>
            <div className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-700">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-farm-600 flex-shrink-0" />
                <span>Single shared REST API connecting passengers, officers, and control room operators</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-farm-600 flex-shrink-0" />
                <span>Local persistence so your entered details never disappear on navigating back</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-farm-600 flex-shrink-0" />
                <span>1-Click Solo and Family passenger demo profiles for rapid evaluation</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F9FBF9] p-6 sm:p-7 rounded-2xl border border-emerald-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <span className="font-bold text-sm text-slate-900">Start Your Journey</span>
              <span className="text-[11px] font-mono font-bold text-farm-800 bg-farm-100 px-2.5 py-0.5 rounded-full border border-farm-200">
                System Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Register your trip details in seconds. Choose between Solo Traveler or Family/Group mode to enable instant distress assistance.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/passenger/onboarding"
                className="w-full text-center py-3.5 px-4 rounded-2xl bg-farm-600 text-white text-xs sm:text-sm font-bold hover:bg-farm-700 shadow-md shadow-farm-700/20 transition-all cursor-pointer"
              >
                Open Passenger Registration
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

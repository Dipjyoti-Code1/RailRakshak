import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Radio, UserCheck, ArrowRight, ArrowLeft, KeyRound, ExternalLink } from 'lucide-react';

export const StaffPortalPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Passenger Portal</span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-farm-600 to-farm-800 text-white flex items-center justify-center mx-auto shadow-md shadow-farm-700/20">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Railway Personnel & Authority Portals
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Internal operational interfaces for verified Railway Protection Force (RPF) escort officers and Central Authority Control Room operators.
        </p>
      </div>

      {/* Two Protected Portals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Portal 1: Officer Duty Portal */}
        <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:border-farm-400 hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-farm-50 text-farm-700 border border-farm-200/60 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-farm-600" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-farm-100 text-farm-800 border border-farm-200">
                RPF Escort Staff
              </span>
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900">
                Officer On-Duty Portal
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Register daily shift rosters, assigned trains, sectors, and coach ranges. Updates officer availability for emergency incident response.
              </p>
            </div>

            <div className="p-3.5 bg-[#F9FBF9] border border-emerald-100 rounded-2xl text-xs space-y-1">
              <span className="font-semibold text-slate-900 block text-[11px]">Permanent Demo Credentials:</span>
              <div className="text-slate-700 font-medium">Username: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-300 text-slate-900">officer</code></div>
              <div className="text-slate-700 font-medium">Password: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-300 text-slate-900">OfficerDuty@2026</code></div>
            </div>
          </div>

          <Link
            to="/officer/login"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-farm-600 hover:bg-farm-700 text-white font-bold text-xs shadow-md shadow-farm-700/20 transition-all cursor-pointer"
          >
            <span>Access Officer Duty Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Portal 2: Authority Control Room */}
        <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:border-slate-400 hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-harvest-50 text-harvest-700 border border-harvest-200/60 flex items-center justify-center">
                <Radio className="w-5 h-5 text-harvest-600" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-harvest-100 text-harvest-900 border border-harvest-300">
                Control Room
              </span>
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900">
                Central Control Room
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Live passenger distress monitoring dashboard. View telemetry on OpenStreetMap Leaflet maps, acknowledge alerts, and coordinate officer dispatch.
              </p>
            </div>

            <div className="p-3.5 bg-[#F9FBF9] border border-emerald-100 rounded-2xl text-xs space-y-1">
              <span className="font-semibold text-slate-900 block text-[11px]">Permanent Demo Credentials:</span>
              <div className="text-slate-700 font-medium">Username: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-300 text-slate-900">admin</code></div>
              <div className="text-slate-700 font-medium">Password: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-300 text-slate-900">ControlRoom@2026</code></div>
            </div>
          </div>

          <Link
            to="/authority/login"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <span>Enter Authority Control Room</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

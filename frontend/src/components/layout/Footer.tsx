import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, PhoneCall, Info, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-slate-400">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-farm-600 to-farm-700 text-white flex items-center justify-center shadow-sm">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base text-white">
                Rail<span className="text-farm-400">Rakshak</span>
              </span>
            </div>
            <p className="leading-relaxed text-slate-400">
              A modern railway passenger safety and emergency assistance platform engineered for calm distress reporting and rapid response coordination.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Info className="w-4 h-4 text-harvest-400" />
              <span className="font-bold text-sm text-white">Demonstration Notice</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              This system is an evaluation prototype built for passenger safety demonstrations. It is not connected to active Indian Railways emergency dispatchers.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <PhoneCall className="w-4 h-4 text-harvest-400" />
              <span className="font-bold text-sm text-white">Official Emergency Lines</span>
            </div>
            <p className="leading-relaxed text-slate-400 mb-2">
              For live transit emergencies on Indian Railways, contact official helplines:
            </p>
            <div className="space-y-1.5 font-mono text-white">
              <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700/60 w-fit">
                <span className="text-harvest-400">Railway Helpline:</span>
                <span className="font-bold text-sm">139</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700/60 w-fit">
                <span className="text-red-400">National Emergency:</span>
                <span className="font-bold text-sm">112</span>
              </div>
            </div>
          </div>

          {/* Dedicated Staff & Official Access */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Lock className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-sm text-white">Staff & Official Portals</span>
            </div>
            <p className="leading-relaxed text-slate-400 mb-2.5">
              Authorized portals with demo authentication:
            </p>
            <ul className="space-y-2 text-[11px]">
              <li>
                <Link
                  to="/staff"
                  className="text-slate-300 hover:text-white hover:underline transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-farm-500"></span>
                  <span>Railway Staff Hub Overview</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/officer/login"
                  className="text-slate-300 hover:text-white hover:underline transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Officer Duty Portal (RPF)</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/authority/login"
                  className="text-slate-300 hover:text-white hover:underline transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-harvest-400"></span>
                  <span>Authority Control Room Login</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>RailRakshak — Your Journey. Your Safety.</span>
          <span>Calm, Warm & Reassuring Passenger Transit Safety</span>
        </div>
      </div>
    </footer>
  );
};

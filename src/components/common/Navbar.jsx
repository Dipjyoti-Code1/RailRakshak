import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Train, Radio, Activity, AlertCircle } from 'lucide-react';

export default function Navbar({ activeEmergencyCount = 0 }) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 shadow-md shadow-red-950/40 border border-red-500/30">
              <Shield className="w-5 h-5 text-white" />
              <Train className="w-3.5 h-3.5 text-amber-300 absolute" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-red-400 transition-colors">
                  RailRakshak
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                  SOS
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 tracking-wide">
                Your Journey. Your Safety.
              </span>
            </div>
          </Link>

          {/* Navigation Pill Switcher */}
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/passenger"
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentPath === '/' || currentPath.startsWith('/passenger')
                  ? 'bg-red-600 text-white shadow-sm shadow-red-900/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Train className="w-4 h-4" />
              <span>Passenger Portal</span>
            </Link>

            <Link
              to="/authority"
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all relative ${
                currentPath.startsWith('/authority')
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Radio className="w-4 h-4 text-amber-400" />
              <span className="flex items-center gap-1.5">
                <span>Authority Control Room</span>
                <span className="hidden md:inline-block text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  DEMO
                </span>
              </span>

              {/* Active alerts bubble */}
              {activeEmergencyCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-lg animate-pulse">
                  {activeEmergencyCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

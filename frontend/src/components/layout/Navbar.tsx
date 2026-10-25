import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Train, Lock } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [activeJourneyId, setActiveJourneyId] = useState<string | null>(null);

  useEffect(() => {
    const jid = localStorage.getItem('railrakshak_active_journey_id');
    setActiveJourneyId(jid);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-farm-600 to-farm-700 text-white shadow-md shadow-farm-700/20 transition-transform group-hover:scale-105">
              <Shield className="w-5 h-5 text-white" />
              <Train className="w-3.5 h-3.5 text-harvest-300 absolute" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-farm-600 transition-colors">
                  Rail<span className="text-farm-600">Rakshak</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-farm-50 text-farm-800 border border-farm-200">
                  Passenger Safety
                </span>
              </div>
              <span className="text-[11px] text-slate-600 font-medium tracking-wide">
                Your Journey. Your Safety.
              </span>
            </div>
          </Link>

          {/* Passenger Centric Navigation */}
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/passenger/onboarding"
              className={`flex items-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                currentPath === '/' || currentPath.startsWith('/passenger/onboarding')
                  ? 'bg-farm-600 text-white shadow-sm hover:bg-farm-700'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
              }`}
            >
              <Train className="w-4 h-4 text-harvest-400" />
              <span>Passenger Portal</span>
            </Link>

            {activeJourneyId && (
              <Link
                to={`/passenger/dashboard?journey_id=${encodeURIComponent(activeJourneyId)}`}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                  currentPath.startsWith('/passenger/dashboard')
                    ? 'bg-farm-700 text-white shadow-sm'
                    : 'bg-emerald-50 text-farm-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Journey</span>
              </Link>
            )}

            {/* Discreet Staff Portal Link */}
            <div className="pl-2 border-l border-slate-200">
              <Link
                to="/staff"
                title="Railway Official & Control Room Portal"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors ${
                  currentPath.startsWith('/staff') || currentPath.startsWith('/authority') || currentPath.startsWith('/officer')
                    ? 'bg-slate-100 text-slate-950 font-bold'
                    : ''
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Staff Access</span>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

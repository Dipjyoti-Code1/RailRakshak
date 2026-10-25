import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import PassengerPage from './pages/PassengerPage';
import AuthorityPage from './pages/AuthorityPage';
import { getEmergencies, SYNC_EVENT_NAME } from './utils/storage';

export default function App() {
  const [activeCount, setActiveCount] = useState(0);

  const calculateActiveCount = () => {
    const list = getEmergencies();
    const count = list.filter((e) => e.emergency?.status === 'ACTIVE').length;
    setActiveCount(count);
  };

  useEffect(() => {
    calculateActiveCount();

    const handleStorage = () => calculateActiveCount();
    const handleCustomSync = () => calculateActiveCount();

    window.addEventListener('storage', handleStorage);
    window.addEventListener(SYNC_EVENT_NAME, handleCustomSync);

    const interval = setInterval(calculateActiveCount, 2500);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(SYNC_EVENT_NAME, handleCustomSync);
      clearInterval(interval);
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-100">
        <Navbar activeEmergencyCount={activeCount} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/passenger" replace />} />
            <Route path="/passenger" element={<PassengerPage />} />
            <Route path="/authority" element={<AuthorityPage />} />
            <Route path="*" element={<Navigate to="/passenger" replace />} />
          </Routes>
        </main>
        
        {/* Simple Footer */}
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 px-4 text-center text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">RailRakshak</span>
              <span>—</span>
              <span>Your Journey. Your Safety.</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Prototype Platform Demonstration • Indian Railways Passenger Safety Concept
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

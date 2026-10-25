import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SystemStatusBanner } from './components/layout/SystemStatusBanner';

import { LandingPage } from './pages/LandingPage';
import { PassengerOnboardingPage } from './pages/PassengerOnboardingPage';
import { PassengerDashboardPage } from './pages/PassengerDashboardPage';
import { StaffPortalPage } from './pages/StaffPortalPage';
import { OfficerLoginPage } from './pages/OfficerLoginPage';
import { OfficerDutyPage } from './pages/OfficerDutyPage';
import { ControlRoomPage } from './pages/ControlRoomPage';
import { AuthorityLoginPage } from './pages/AuthorityLoginPage';

// ─── Authority Auth Guard ──────────────────────────────────────────────────────
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('railrakshak_auth_token');
  const location = useLocation();
  if (!token) {
    return <Navigate to="/authority/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

// ─── Officer Auth Guard ────────────────────────────────────────────────────────
const RequireOfficerAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('railrakshak_officer_token');
  const location = useLocation();
  if (!token) {
    return <Navigate to="/officer/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

// ─── Scroll to top on route change ────────────────────────────────────────────
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

// ─── App Shell ────────────────────────────────────────────────────────────────
const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F9FBF9] text-[#1E293B]">
      <SystemStatusBanner />
      <Navbar />
      <main className="flex-1">
        <ScrollToTop />
        <Routes>
          {/* Passenger Portal routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/passenger" element={<Navigate to="/passenger/onboarding" replace />} />
          <Route path="/passenger/onboarding" element={<PassengerOnboardingPage />} />
          <Route path="/passenger/dashboard" element={<PassengerDashboardPage />} />

          {/* Dedicated Staff Gateway and Login */}
          <Route path="/staff" element={<StaffPortalPage />} />
          <Route path="/officer/login" element={<OfficerLoginPage />} />
          <Route path="/authority/login" element={<AuthorityLoginPage />} />

          {/* Protected Officer Duty route */}
          <Route
            path="/officer/duty"
            element={
              <RequireOfficerAuth>
                <OfficerDutyPage />
              </RequireOfficerAuth>
            }
          />

          {/* Protected Authority Control Room route */}
          <Route
            path="/authority"
            element={
              <RequireAuth>
                <ControlRoomPage />
              </RequireAuth>
            }
          />

          {/* Catch-all redirect to passenger home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
};

export default App;

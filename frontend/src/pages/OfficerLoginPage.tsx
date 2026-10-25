import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, UserCheck, KeyRound, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';

export const OfficerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('officer');
  const [password, setPassword] = useState('OfficerDuty@2026');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (u: string, p: string) => {
    setLoading(true);
    setError(null);

    // Verified Demo Authentication for RPF Officers
    if (u.trim().toLowerCase() === 'officer' && p === 'OfficerDuty@2026') {
      localStorage.setItem('railrakshak_officer_token', 'demo_officer_token_' + Date.now());
      localStorage.setItem('railrakshak_officer_name', 'Insp. Vikram Singh (RPF)');
      setTimeout(() => {
        setLoading(false);
        navigate('/officer/duty');
      }, 300);
    } else {
      setLoading(false);
      setError('Invalid officer staff identifier or password. Please use the permanent demo credentials below.');
    }
  };

  const handleQuickDemoLogin = () => {
    setUsername('officer');
    setPassword('OfficerDuty@2026');
    handleLogin('officer', 'OfficerDuty@2026');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(username, password);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <button
        type="button"
        onClick={() => navigate('/staff')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Staff Portals</span>
      </button>

      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-farm-600 to-farm-700 text-white flex items-center justify-center mx-auto shadow-md shadow-farm-700/20">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Officer Duty Login
          </h1>
          <p className="text-xs text-slate-600">
            RPF Escort and Railway Station Duty Personnel Authentication
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Demo Credentials Card with 1-Click Login */}
        <div className="p-4 bg-farm-50/70 border border-farm-200/80 rounded-2xl text-xs text-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold block text-slate-900">Permanent Demo Credentials:</span>
            <span className="text-[10px] uppercase font-bold bg-farm-100 text-farm-900 border border-farm-300 px-2.5 py-0.5 rounded-full shadow-2xs">
              RPF Staff
            </span>
          </div>
          <div className="text-[11px] text-slate-700">
            Username: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-900">officer</code>
          </div>
          <div className="text-[11px] text-slate-700">
            Password: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-900">OfficerDuty@2026</code>
          </div>

          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="w-full mt-1 py-2.5 bg-farm-600 hover:bg-farm-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <Sparkles className="w-3.5 h-3.5 text-harvest-300" />
            <span>1-Click Quick Demo Login</span>
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-800 mb-1">Staff ID / Username</label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-60"
          >
            {loading ? 'Authenticating...' : 'Sign In as Officer'}
          </button>
        </form>
      </div>
    </div>
  );
};

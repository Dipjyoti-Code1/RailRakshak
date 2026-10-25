import React, { useEffect, useState } from 'react';
import { Database, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../../api/client';
import { SystemHealthResponse } from '../../types';

export const SystemStatusBanner: React.FC = () => {
  const [health, setHealth] = useState<SystemHealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchHealth = async () => {
      try {
        const data = await api.getHealth();
        if (mounted) {
          setHealth(data);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Cannot reach backend service');
        }
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (error) {
    return (
      <div className="bg-red-50/90 border-b border-red-200 text-red-800 px-4 py-2 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>
            <strong>Backend Offline:</strong> Unable to connect to RailRakshak API at port 8000. Ensure the FastAPI backend server is running.
          </span>
        </div>
      </div>
    );
  }

  if (!health) return null;

  const isDemoStore = health.database?.type === 'LOCAL_DEMO_STORE';

  return (
    <div className={`border-b text-xs px-4 py-1.5 transition-colors ${
      isDemoStore
        ? 'bg-emerald-50/60 border-emerald-100 text-emerald-950'
        : 'bg-emerald-100/70 border-emerald-200 text-farm-900'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-farm-600 flex-shrink-0" />
          <span>
            <strong>Storage Status:</strong>{' '}
            {isDemoStore ? (
              <span>
                Operating in <span className="font-semibold underline">LOCAL_DEMO_STORE</span> mode (local persistent document store). To connect live MongoDB, configure <code className="bg-white/80 px-1 py-0.5 rounded border border-emerald-200 font-mono text-[11px]">MONGODB_URI</code> in <code className="bg-white/80 px-1 py-0.5 rounded border border-emerald-200 font-mono text-[11px]">backend/.env</code>.
              </span>
            ) : (
              <span>Connected to Live MongoDB Database (<span className="font-semibold">{health.database?.type}</span>).</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-700 font-medium flex-shrink-0">
          <span className="inline-block w-2 h-2 rounded-full bg-farm-600 animate-pulse"></span>
          <span>Prototype MVP • Non-Official Demonstration</span>
        </div>
      </div>
    </div>
  );
};

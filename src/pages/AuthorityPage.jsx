import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Radio,
  RefreshCw,
  Search,
  Filter,
  Eye,
  SlidersHorizontal,
  BellRing,
  AlertTriangle
} from 'lucide-react';
import SummaryCards from '../components/authority/SummaryCards';
import AlertsTable from '../components/authority/AlertsTable';
import EmergencyDetailsPanel from '../components/authority/EmergencyDetailsPanel';
import DemoAlertGenerator from '../components/authority/DemoAlertGenerator';
import {
  getEmergencies,
  updateEmergencyStatus,
  SYNC_EVENT_NAME
} from '../utils/storage';

export default function AuthorityPage() {
  const [emergencies, setEmergencies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date());
  const [newAlertNotification, setNewAlertNotification] = useState(null);

  // Load emergencies from storage
  const loadRecords = useCallback(() => {
    const list = getEmergencies();
    setEmergencies(list);
    setLastRefreshedAt(new Date());

    // If an emergency is currently open in the details panel, keep it updated
    setSelectedEmergency((prev) => {
      if (!prev) return null;
      const updated = list.find((e) => e.emergencyId === prev.emergencyId);
      return updated || null;
    });
  }, []);

  // Multi-tab synchronisation and polling
  useEffect(() => {
    loadRecords();

    // 1. Listen to storage changes across tabs
    const handleStorageChange = () => {
      loadRecords();
    };

    // 2. Listen to custom sync event in same window
    const handleCustomSync = () => {
      loadRecords();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(SYNC_EVENT_NAME, handleCustomSync);

    // 3. Fallback interval polling every 2 seconds for guaranteed realtime sync
    const interval = setInterval(() => {
      const freshList = getEmergencies();
      setEmergencies((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(freshList)) {
          // If a new active emergency arrived that wasn't in previous, show toast
          const prevIds = new Set(prev.map(p => p.emergencyId));
          const newActives = freshList.filter(f => !prevIds.has(f.emergencyId) && f.emergency?.status === 'ACTIVE');
          if (newActives.length > 0) {
            setNewAlertNotification(`New SOS alert received: ${newActives[0].emergencyId} (Train ${newActives[0].journey?.trainNumber || 'N/A'})`);
            setTimeout(() => setNewAlertNotification(null), 6000);
          }
          return freshList;
        }
        return prev;
      });
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(SYNC_EVENT_NAME, handleCustomSync);
      clearInterval(interval);
    };
  }, [loadRecords]);

  // Handle status update
  const handleUpdateStatus = (emergencyId, newStatus) => {
    const res = updateEmergencyStatus(emergencyId, newStatus);
    if (res.success) {
      loadRecords();
      if (selectedEmergency && selectedEmergency.emergencyId === emergencyId) {
        setSelectedEmergency(res.record);
      }
    } else {
      alert(`Status update failed: ${res.error}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Disclaimer Banner */}
        <div className="bg-amber-500 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm border border-amber-600/30">
          <div className="flex items-center gap-2">
            <span className="bg-black text-amber-300 px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase">
              Notice
            </span>
            <span>
              This is a <strong>DEMO CONTROL ROOM</strong> prototype for evaluation. Do not represent or use this interface as an actual Indian Railways control room.
            </span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 bg-amber-400 px-2 py-0.5 rounded">
            Prototype Simulation
          </span>
        </div>

        {/* Header Block */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-blue-600 text-white text-xs font-black uppercase tracking-wider">
                Authority Operations
              </span>
              <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wide">
                DEMO ENVIRONMENT
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>RailRakshak — Authority Control Room</span>
            </h1>
            <p className="text-sm text-slate-300">
              Live distress monitoring, passenger location telemetry, and emergency dispatch management.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <DemoAlertGenerator
              onEmergencyCreated={(record) => {
                loadRecords();
                setSelectedEmergency(record);
              }}
              onClearAll={() => {
                loadRecords();
                setSelectedEmergency(null);
              }}
            />

            <button
              type="button"
              onClick={loadRecords}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Refresh alerts"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Realtime Alert Arrival Toast */}
        {newAlertNotification && (
          <div className="bg-red-600 text-white px-5 py-3 rounded-xl shadow-lg border border-red-500 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2.5">
              <BellRing className="w-5 h-5 text-amber-300 animate-bounce" />
              <span className="font-bold text-sm">{newAlertNotification}</span>
            </div>
            <button
              onClick={() => setNewAlertNotification(null)}
              className="text-xs bg-red-700 hover:bg-red-800 px-2.5 py-1 rounded font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Summary Metric Cards */}
        <SummaryCards
          emergencies={emergencies}
          activeFilter={statusFilter}
          onSelectFilter={(filterKey) => setStatusFilter(filterKey)}
        />

        {/* Main Alerts Table */}
        <AlertsTable
          emergencies={emergencies}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onSelectEmergency={(rec) => setSelectedEmergency(rec)}
          selectedEmergencyId={selectedEmergency?.emergencyId}
        />

        {/* Emergency Details Side Panel / Drawer */}
        {selectedEmergency && (
          <EmergencyDetailsPanel
            emergency={selectedEmergency}
            onClose={() => setSelectedEmergency(null)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </div>
    </div>
  );
}

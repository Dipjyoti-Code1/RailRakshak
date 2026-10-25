import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radio,
  RefreshCw,
  Sparkles,
  AlertCircle,
  BellRing,
  Filter,
  ShieldAlert,
  Trash2,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { IncidentResponse, IncidentStatus } from '../types';
import { IncidentSummaryCards } from '../components/authority/IncidentSummaryCards';
import { IncidentsFilterTable } from '../components/authority/IncidentsFilterTable';
import { IncidentDetailDrawer } from '../components/authority/IncidentDetailDrawer';
import { api } from '../api/client';

export const ControlRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<IncidentResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedIncident, setSelectedIncident] = useState<IncidentResponse | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('railrakshak_auth_token');
    localStorage.removeItem('railrakshak_authority_user');
    navigate('/staff');
  };

  const fetchIncidents = useCallback(async () => {
    try {
      const data = await api.listIncidents({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        search: searchTerm.trim() || undefined
      });
      setIncidents(data);

      // Keep selected incident updated if open in drawer
      setSelectedIncident((prev) => {
        if (!prev) return null;
        const fresh = data.find((i) => i.incident_id === prev.incident_id);
        return fresh || prev;
      });
    } catch (err: any) {
      console.error('Failed to load incidents', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, searchTerm]);

  // Initial fetch and automatic background polling every 3 seconds for real-time operations
  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 3000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  const handleUpdateStatus = async (
    incidentId: string,
    newStatus: IncidentStatus,
    notes?: string
  ) => {
    try {
      const updated = await api.updateIncidentStatus(incidentId, {
        status: newStatus,
        notes,
        updated_by: 'Control Room Officer'
      });
      setToastNotification(`Incident ${incidentId} updated to ${newStatus}.`);
      setSelectedIncident(updated);
      fetchIncidents();
      setTimeout(() => setToastNotification(null), 5000);
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleTriggerDemoIncident = async () => {
    try {
      // 1. Create a demo journey first
      const demoJourney = await api.createJourney({
        traveler_type: 'SOLO',
        primary_passenger: {
          full_name: 'Simulated Traveler (DEMO)',
          mobile_number: '9876543210',
          age: 34,
          gender: 'Male',
          emergency_contact_name: 'Contact Person',
          emergency_contact_mobile: '9876543211'
        },
        group_members: [],
        train_number: '12004',
        train_name: 'Lucknow Shatabdi Express',
        boarding_station: 'New Delhi (NDLS)',
        destination_station: 'Kanpur Central (CNB)',
        journey_date: new Date().toISOString().split('T')[0],
        coach: 'C-2',
        seat: '28'
      });

      // 2. Trigger SOS incident with sample coordinates near New Delhi
      const demoIncident = await api.createIncident({
        journey_id: demoJourney.journey_id,
        affected_person: {
          full_name: 'Simulated Traveler (DEMO)',
          relationship: 'Self',
          assistance_needs: 'Wheelchair / Elderly Mobility'
        },
        category: 'UNWELL',
        description: 'Severe chest tightness and sudden dizziness reported in coach C2.',
        location: {
          latitude: 28.6431,
          longitude: 77.2197,
          accuracy_meters: 12.0,
          last_updated_at: new Date().toISOString(),
          available: true,
          permission_status: 'granted'
        },
        is_demo: true
      });

      setToastNotification(`Demo incident ${demoIncident.incident_id} created with simulated GPS coordinates.`);
      setSelectedIncident(demoIncident);
      fetchIncidents();
      setTimeout(() => setToastNotification(null), 6000);
    } catch (err: any) {
      alert(`Failed to load demo incident: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Bar with Staff Navigation & Sign Out */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/staff')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Staff Portals</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-farm-900 bg-farm-50 px-3 py-1 rounded-xl border border-farm-200">
            Operator Console (admin)
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Demo Notice Banner */}
      <div className="bg-harvest-50 border border-harvest-200 text-harvest-950 px-4 py-2.5 rounded-2xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-harvest-600 flex-shrink-0" />
          <span className="text-slate-800">
            <strong className="text-harvest-900">DEMO ENVIRONMENT:</strong> This simulated authority console connects to the shared RailRakshak backend database for prototype review. Not an actual railway operations desk.
          </span>
        </div>
        <span className="font-bold uppercase tracking-wider text-[10px] bg-harvest-200 text-harvest-950 border border-harvest-300 px-2.5 py-0.5 rounded-full flex-shrink-0">
          Simulated Ops
        </span>
      </div>

      {/* Control Room Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-farm-100 text-farm-800 border border-farm-200">
              Operations Command
            </span>
            <span className="text-xs font-semibold text-slate-600">
              Live Distress Monitoring & Dispatch Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            RailRakshak — Authority Control Room
          </h1>
          <p className="text-xs text-slate-600">
            Connected to shared FastAPI REST API and persistent database. Status updates synchronize instantly with the passenger dashboard.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleTriggerDemoIncident}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-harvest-400 hover:bg-harvest-500 text-slate-950 text-xs font-bold rounded-2xl shadow-sm border border-harvest-500 transition-all cursor-pointer"
            title="Creates a sample incident with fictional passenger data and simulated GPS coordinates"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>+ Simulate Demo Incident</span>
          </button>

          <button
            type="button"
            onClick={fetchIncidents}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200 cursor-pointer"
            title="Refresh incidents"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {toastNotification && (
        <div className="bg-farm-700 text-white px-5 py-3 rounded-2xl shadow-md border border-emerald-500/30 flex items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-harvest-300" />
            <span className="font-semibold">{toastNotification}</span>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="text-white/80 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metric Summary Cards */}
      <IncidentSummaryCards
        incidents={incidents}
        activeFilter={statusFilter}
        onSelectFilter={(f) => setStatusFilter(f)}
      />

      {/* Main Filterable Incidents Table */}
      <IncidentsFilterTable
        incidents={incidents}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        onSelectIncident={(inc) => setSelectedIncident(inc)}
        selectedIncidentId={selectedIncident?.incident_id}
      />

      {/* Detail Drawer */}
      {selectedIncident && (
        <IncidentDetailDrawer
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

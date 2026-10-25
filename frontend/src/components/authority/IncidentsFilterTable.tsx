import React from 'react';
import { Search, Filter, Eye, MapPin, AlertCircle, Calendar } from 'lucide-react';
import { IncidentResponse, IncidentStatus, IncidentCategory } from '../../types';

interface TableProps {
  incidents: IncidentResponse[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (val: string) => void;
  onSelectIncident: (inc: IncidentResponse) => void;
  selectedIncidentId?: string;
}

export const IncidentsFilterTable: React.FC<TableProps> = ({
  incidents,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  onSelectIncident,
  selectedIncidentId
}) => {
  const getStatusBadge = (st: IncidentStatus) => {
    switch (st) {
      case 'ACTIVE':
        return 'bg-red-100 text-red-800 border-red-300 font-bold';
      case 'ACKNOWLEDGED':
        return 'bg-harvest-100 text-harvest-900 border-harvest-300 font-bold';
      case 'IN_PROGRESS':
        return 'bg-sky-100 text-sky-900 border-sky-300 font-bold';
      case 'RESOLVED':
        return 'bg-farm-100 text-farm-900 border-farm-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300 font-bold';
    }
  };

  const getRowHighlight = (status: IncidentStatus, isSelected: boolean) => {
    if (isSelected) return 'bg-farm-50/70 ring-2 ring-farm-600/30';
    switch (status) {
      case 'ACTIVE':
        return 'bg-red-50/30 hover:bg-red-50/60 border-l-4 border-l-red-600';
      case 'ACKNOWLEDGED':
        return 'bg-harvest-50/30 hover:bg-harvest-50/60 border-l-4 border-l-harvest-500';
      case 'IN_PROGRESS':
        return 'bg-sky-50/30 hover:bg-sky-50/60 border-l-4 border-l-sky-500';
      case 'RESOLVED':
        return 'bg-farm-50/20 hover:bg-farm-50/40 border-l-4 border-l-farm-500';
      default:
        return 'hover:bg-slate-50 border-l-4 border-l-transparent';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-0">
      {/* Search and Filters Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-[#F9FBF9] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search Incident ID, Train #, Passenger..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Distress</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
            >
              <option value="ALL">All Categories</option>
              <option value="UNWELL">Unwell / Medical</option>
              <option value="LOST_OR_SEPARATED">Lost / Separated</option>
              <option value="PERSONAL_SAFETY_CONCERN">Personal Safety</option>
              <option value="URGENT_ASSISTANCE">Urgent Assistance</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F9FBF9] border-b border-slate-100 text-farm-900 uppercase text-[10px] font-bold tracking-wider">
              <th className="py-3.5 px-4">Incident ID</th>
              <th className="py-3.5 px-4">Affected Person</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Train & Coach</th>
              <th className="py-3.5 px-4">Reported Time</th>
              <th className="py-3.5 px-4">Location Fix</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-sm text-slate-900">No assistance incidents found</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
                      ? 'Adjust your search or filter options.'
                      : 'Emergency requests submitted by travelers will appear here instantly.'}
                  </p>
                </td>
              </tr>
            ) : (
              incidents.map((inc) => {
                const isSelected = selectedIncidentId === inc.incident_id;
                const snap = inc.journey_snapshot;

                return (
                  <tr
                    key={inc.incident_id}
                    onClick={() => onSelectIncident(inc)}
                    className={`transition-colors cursor-pointer ${getRowHighlight(inc.status, isSelected)}`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{inc.incident_id}</span>
                        {inc.is_demo && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-harvest-100 text-harvest-800">
                            DEMO
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      <div>{inc.affected_person.full_name}</div>
                      {inc.affected_person.relationship && (
                        <div className="text-[11px] text-slate-500 font-normal">
                          {inc.affected_person.relationship}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-800 whitespace-nowrap font-medium">
                      {inc.category.replace(/_/g, ' ')}
                    </td>

                    <td className="py-3.5 px-4 text-slate-800 whitespace-nowrap">
                      <div className="font-mono font-semibold">
                        Train {snap?.train_number || 'N/A'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Coach {snap?.coach || '—'}, Seat {snap?.seat || '—'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      <div className="font-medium text-slate-900">
                        {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(inc.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {inc.location?.available ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-farm-50 text-farm-700 border border-farm-200">
                          <MapPin className="w-3 h-3 text-farm-600" />
                          GPS Fix
                        </span>
                      ) : inc.location?.manual_station ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-harvest-50 text-harvest-700 border border-harvest-200">
                          Station Entry
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-50 text-slate-500 border border-slate-200">
                          Unavailable
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(inc.status)}`}>
                        {inc.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIncident(inc);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-farm-50 hover:bg-farm-600 text-farm-800 hover:text-white border border-farm-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3.5 bg-[#F9FBF9] border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
        <span>
          Showing <strong>{incidents.length}</strong> active incident records
        </span>
        <span className="text-[11px] text-slate-500">Sorted newest first • Shared REST API source</span>
      </div>
    </div>
  );
};

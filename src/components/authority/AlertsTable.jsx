import React from 'react';
import { Search, Filter, Eye, MapPin, AlertCircle, ArrowUpDown, ChevronRight } from 'lucide-react';
import Badge from '../common/Badge';
import { formatCoordinates, formatDateTime, formatTimeOnly } from '../../utils/formatters';

export default function AlertsTable({
  emergencies,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onSelectEmergency,
  selectedEmergencyId
}) {
  // Filter logic
  const filteredEmergencies = emergencies
    .filter((e) => {
      // Status filter
      if (statusFilter !== 'ALL' && e.emergency?.status !== statusFilter) {
        return false;
      }
      // Search term filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const idMatch = e.emergencyId?.toLowerCase().includes(query);
        const trainMatch = e.journey?.trainNumber?.toLowerCase().includes(query);
        const passengerMatch = e.passenger?.fullName?.toLowerCase().includes(query);
        const stationMatch =
          e.journey?.boardingStation?.toLowerCase().includes(query) ||
          e.journey?.destinationStation?.toLowerCase().includes(query);
        return idMatch || trainMatch || passengerMatch || stationMatch;
      }
      return true;
    })
    .sort((a, b) => {
      // Newest emergency first
      const timeA = new Date(a.emergency?.createdAt || 0).getTime();
      const timeB = new Date(b.emergency?.createdAt || 0).getTime();
      return timeB - timeA;
    });

  // Highlight classes based on emergency status
  const getRowHighlight = (status, isSelected) => {
    if (isSelected) return 'bg-slate-100 ring-2 ring-blue-500/50';
    switch (status) {
      case 'ACTIVE':
        return 'bg-red-50/40 hover:bg-red-50/70 border-l-4 border-l-red-600';
      case 'ACKNOWLEDGED':
        return 'bg-amber-50/30 hover:bg-amber-50/60 border-l-4 border-l-amber-500';
      case 'IN PROGRESS':
        return 'bg-blue-50/30 hover:bg-blue-50/60 border-l-4 border-l-blue-500';
      case 'RESOLVED':
        return 'bg-emerald-50/20 hover:bg-emerald-50/40 border-l-4 border-l-emerald-600';
      default:
        return 'hover:bg-slate-50 border-l-4 border-l-transparent';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Search and Filters Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Emergency ID, Train Number, Passenger..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-600">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Emergencies</option>
            <option value="ACTIVE">Active (Red)</option>
            <option value="ACKNOWLEDGED">Acknowledged (Orange)</option>
            <option value="IN PROGRESS">In Progress (Blue)</option>
            <option value="RESOLVED">Resolved (Green)</option>
          </select>
        </div>
      </div>

      {/* Table display */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold tracking-wider">
              <th className="py-3 px-4">Emergency ID</th>
              <th className="py-3 px-4">Passenger Name</th>
              <th className="py-3 px-4">Train No.</th>
              <th className="py-3 px-4">Boarding Station</th>
              <th className="py-3 px-4">Destination</th>
              <th className="py-3 px-4">Emergency Time</th>
              <th className="py-3 px-4">GPS Telemetry</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEmergencies.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-sm text-slate-700">No emergency alerts found</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {searchTerm || statusFilter !== 'ALL'
                      ? 'Try adjusting your search criteria or filter options.'
                      : 'Emergency alerts triggered by passengers will appear here automatically.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredEmergencies.map((e) => {
                const isSelected = selectedEmergencyId === e.emergencyId;
                const status = e.emergency?.status || 'ACTIVE';
                const hasLocation = e.location?.available;

                return (
                  <tr
                    key={e.emergencyId}
                    className={`transition-colors cursor-pointer ${getRowHighlight(status, isSelected)}`}
                    onClick={() => onSelectEmergency(e)}
                  >
                    {/* Emergency ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{e.emergencyId}</span>
                        {e.emergency?.isDemo && (
                          <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-200 text-amber-900">
                            DEMO
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Passenger Name */}
                    <td className="py-3.5 px-4 font-medium text-slate-900 whitespace-nowrap">
                      {e.passenger?.fullName || 'N/A'}
                    </td>

                    {/* Train Number */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 whitespace-nowrap">
                      {e.journey?.trainNumber || 'N/A'}
                    </td>

                    {/* Boarding Station */}
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      {e.journey?.boardingStation || '—'}
                    </td>

                    {/* Destination Station */}
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      {e.journey?.destinationStation || '—'}
                    </td>

                    {/* Emergency Time */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">
                          {formatTimeOnly(e.emergency?.createdAt)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(e.emergency?.createdAt || 0).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Location Availability */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {hasLocation ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          GPS Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                          Unavailable
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge status={status} isDemo={false} size="sm" />
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(evt) => {
                          evt.stopPropagation();
                          onSelectEmergency(e);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count indicator */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>
          Showing <strong>{filteredEmergencies.length}</strong> of <strong>{emergencies.length}</strong> incident records
        </span>
        <span className="text-slate-400">Sorted by newest emergency first</span>
      </div>
    </div>
  );
}

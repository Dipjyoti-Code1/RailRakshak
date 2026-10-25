import React from 'react';
import { Train, Calendar, Clock, MapPin } from 'lucide-react';

export default function JourneyForm({ data, onChange, errors }) {
  const handleChange = (field, value) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 transition-all hover:shadow-md">
      <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
          <Train className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-base">Journey Details</h3>
          <p className="text-xs text-slate-500">Enter your train and ticket travel details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Train Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Train Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. 12004 or 12301"
            value={data.trainNumber || ''}
            onChange={(e) => handleChange('trainNumber', e.target.value.toUpperCase())}
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
              errors.trainNumber
                ? 'border-red-400 focus:ring-red-400/30 bg-red-50/30'
                : 'border-slate-300 focus:border-red-500 focus:ring-red-500/20'
            }`}
          />
          {errors.trainNumber && (
            <p className="text-xs font-medium text-red-600 mt-1 flex items-center gap-1">
              <span>⚠</span> {errors.trainNumber}
            </p>
          )}
        </div>

        {/* Train Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Train Name <span className="text-slate-400 text-[11px] font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Lucknow Shatabdi Express"
            value={data.trainName || ''}
            onChange={(e) => handleChange('trainName', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
          >
          </input>
        </div>

        {/* Boarding Station */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Boarding Station <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400">
              <MapPin className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="e.g. New Delhi (NDLS)"
              value={data.boardingStation || ''}
              onChange={(e) => handleChange('boardingStation', e.target.value)}
              className={`w-full pl-9 pr-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                errors.boardingStation
                  ? 'border-red-400 focus:ring-red-400/30 bg-red-50/30'
                  : 'border-slate-300 focus:border-red-500 focus:ring-red-500/20'
              }`}
            />
          </div>
          {errors.boardingStation && (
            <p className="text-xs font-medium text-red-600 mt-1 flex items-center gap-1">
              <span>⚠</span> {errors.boardingStation}
            </p>
          )}
        </div>

        {/* Destination Station */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Destination Station <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400">
              <MapPin className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="e.g. Kanpur Central (CNB)"
              value={data.destinationStation || ''}
              onChange={(e) => handleChange('destinationStation', e.target.value)}
              className={`w-full pl-9 pr-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                errors.destinationStation
                  ? 'border-red-400 focus:ring-red-400/30 bg-red-50/30'
                  : 'border-slate-300 focus:border-red-500 focus:ring-red-500/20'
              }`}
            />
          </div>
          {errors.destinationStation && (
            <p className="text-xs font-medium text-red-600 mt-1 flex items-center gap-1">
              <span>⚠</span> {errors.destinationStation}
            </p>
          )}
        </div>

        {/* Coach Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Coach Number <span className="text-slate-400 text-[11px] font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. B-3, S-5, or C-2"
            value={data.coachNumber || ''}
            onChange={(e) => handleChange('coachNumber', e.target.value.toUpperCase())}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
          />
        </div>

        {/* Seat / Berth Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Seat / Berth <span className="text-slate-400 text-[11px] font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. 42 (UB), 19 (SL)"
            value={data.seatNumber || ''}
            onChange={(e) => handleChange('seatNumber', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
          />
        </div>

        {/* Journey Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Journey Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={data.journeyDate || ''}
              onChange={(e) => handleChange('journeyDate', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                errors.journeyDate
                  ? 'border-red-400 focus:ring-red-400/30 bg-red-50/30'
                  : 'border-slate-300 focus:border-red-500 focus:ring-red-500/20'
              }`}
            />
          </div>
          {errors.journeyDate && (
            <p className="text-xs font-medium text-red-600 mt-1 flex items-center gap-1">
              <span>⚠</span> {errors.journeyDate}
            </p>
          )}
        </div>

        {/* Expected Arrival Time */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Expected Arrival <span className="text-slate-400 text-[11px] font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <input
              type="time"
              value={data.expectedArrivalTime || ''}
              onChange={(e) => handleChange('expectedArrivalTime', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

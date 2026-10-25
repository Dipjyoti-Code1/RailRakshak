import React from 'react';
import { User, Phone, ShieldAlert, HeartHandshake } from 'lucide-react';

export default function PassengerForm({ data, onChange, errors }) {
  const handleChange = (field, value) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 transition-all hover:shadow-md">
      <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
        <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-100">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-base">Passenger Information</h3>
          <p className="text-xs text-slate-500">Provide personal and emergency contact details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Rahul Sharma"
            value={data.fullName || ''}
            onChange={(e) => handleChange('fullName', e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
              errors.fullName
                ? 'border-red-400 focus:ring-red-400/30 bg-red-50/30'
                : 'border-slate-300 focus:border-red-500 focus:ring-red-500/20'
            }`}
          />
          {errors.fullName && (
            <p className="text-xs font-medium text-red-600 mt-1 flex items-center gap-1">
              <span>⚠</span> {errors.fullName}
            </p>
          )}
        </div>

        {/* Age */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Age <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            max="120"
            placeholder="e.g. 28"
            value={data.age ?? ''}
            onChange={(e) => handleChange('age', e.target.value ? parseInt(e.target.value, 10) : '')}
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
              errors.age
                ? 'border-red-400 focus:ring-red-400/30 bg-red-50/30'
                : 'border-slate-300 focus:border-red-500 focus:ring-red-500/20'
            }`}
          />
          {errors.age && (
            <p className="text-xs font-medium text-red-600 mt-1 flex items-center gap-1">
              <span>⚠</span> {errors.age}
            </p>
          )}
        </div>

        {/* Gender (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Gender <span className="text-slate-400 text-[11px] font-normal">(Optional)</span>
          </label>
          <select
            value={data.gender || ''}
            onChange={(e) => handleChange('gender', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        {/* Mobile Number */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-500 select-none">
              +91
            </span>
            <input
              type="tel"
              maxLength={10}
              placeholder="10-digit mobile number"
              value={data.mobileNumber || ''}
              onChange={(e) => handleChange('mobileNumber', e.target.value.replace(/\D/g, ''))}
              className={`w-full pl-12 pr-3.5 py-2.5 rounded-lg border text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                errors.mobileNumber
                  ? 'border-red-400 focus:ring-red-400/30 bg-red-50/30'
                  : 'border-slate-300 focus:border-red-500 focus:ring-red-500/20'
              }`}
            />
          </div>
          {errors.mobileNumber && (
            <p className="text-xs font-medium text-red-600 mt-1 flex items-center gap-1">
              <span>⚠</span> {errors.mobileNumber}
            </p>
          )}
        </div>

        {/* Section Divider: Emergency Contact */}
        <div className="sm:col-span-2 pt-3 mt-1 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <HeartHandshake className="w-4 h-4 text-red-500" />
          <span>Emergency Contact Person</span>
        </div>

        {/* Emergency Contact Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Contact Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Priya Sharma (Sister)"
            value={data.emergencyContactName || ''}
            onChange={(e) => handleChange('emergencyContactName', e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
              errors.emergencyContactName
                ? 'border-red-400 focus:ring-red-400/30 bg-red-50/30'
                : 'border-slate-300 focus:border-red-500 focus:ring-red-500/20'
            }`}
          />
          {errors.emergencyContactName && (
            <p className="text-xs font-medium text-red-600 mt-1 flex items-center gap-1">
              <span>⚠</span> {errors.emergencyContactName}
            </p>
          )}
        </div>

        {/* Emergency Contact Mobile */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Contact Mobile <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-500 select-none">
              +91
            </span>
            <input
              type="tel"
              maxLength={10}
              placeholder="10-digit mobile number"
              value={data.emergencyContactMobile || ''}
              onChange={(e) => handleChange('emergencyContactMobile', e.target.value.replace(/\D/g, ''))}
              className={`w-full pl-12 pr-3.5 py-2.5 rounded-lg border text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                errors.emergencyContactMobile
                  ? 'border-red-400 focus:ring-red-400/30 bg-red-50/30'
                  : 'border-slate-300 focus:border-red-500 focus:ring-red-500/20'
              }`}
            />
          </div>
          {errors.emergencyContactMobile && (
            <p className="text-xs font-medium text-red-600 mt-1 flex items-center gap-1">
              <span>⚠</span> {errors.emergencyContactMobile}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

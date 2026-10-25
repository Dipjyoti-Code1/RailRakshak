import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserCheck, Shield, Clock, PlusCircle, AlertCircle, CheckCircle2, PhoneCall, Sparkles, ArrowLeft, LogOut } from 'lucide-react';
import { OfficerDutyCreate, OfficerDutyResponse, OfficerShift, OfficerDutyStatus } from '../types';
import { api } from '../api/client';
import { OfficerEmergencyNotification } from '../components/officer/OfficerEmergencyNotification';

const officerSchema = z.object({
  officer_name: z.string().min(2, 'Officer name must be at least 2 characters'),
  staff_id: z.string().min(2, 'Staff ID is required'),
  designation: z.string().min(2, 'Designation is required'),
  duty_date: z.string().min(8, 'Duty date is required'),
  shift: z.enum(['MORNING', 'AFTERNOON', 'NIGHT', 'FULL_DAY']),
  assigned_train_or_area: z.string().min(2, 'Assigned train or operational sector is required'),
  coach: z.string().optional(),
  duty_start_time: z.string().min(3, 'Start time is required'),
  duty_end_time: z.string().min(3, 'End time is required'),
  contact_number: z.string().optional(),
  status: z.enum(['ON_DUTY', 'OFF_DUTY', 'ON_LEAVE']),
  is_demo: z.boolean().default(true)
});

type OfficerFormData = z.infer<typeof officerSchema>;

export const OfficerDutyPage: React.FC = () => {
  const navigate = useNavigate();
  const [officers, setOfficers] = useState<OfficerDutyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [assignedTrain, setAssignedTrain] = useState<string>('12004');
  const officerName = localStorage.getItem('railrakshak_officer_name') || 'Insp. Vikram Singh (RPF)';

  const handleLogout = () => {
    localStorage.removeItem('railrakshak_officer_token');
    localStorage.removeItem('railrakshak_officer_name');
    navigate('/staff');
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<OfficerFormData>({
    resolver: zodResolver(officerSchema),
    defaultValues: {
      officer_name: '',
      staff_id: '',
      designation: 'RPF Escort Officer',
      duty_date: new Date().toISOString().split('T')[0],
      shift: 'MORNING',
      assigned_train_or_area: 'Train 12004 / Northern Sector',
      coach: 'Coaches B1-B5',
      duty_start_time: '06:00',
      duty_end_time: '14:00',
      contact_number: '9876543200',
      status: 'ON_DUTY',
      is_demo: true
    }
  });

  const loadOfficers = async () => {
    try {
      setLoading(true);
      const data = await api.listOfficersOnDuty();
      setOfficers(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOfficers();
  }, []);

  const handleFormSubmit = async (data: OfficerFormData) => {
    setSubmitting(true);
    setFeedback(null);
    try {
      const saved = await api.registerOfficerDuty(data as OfficerDutyCreate);
      setFeedback({
        type: 'success',
        message: `Duty roster for ${saved.officer_name} registered successfully (Duty ID: ${saved.duty_id}).`
      });
      reset();
      loadOfficers();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to persist duty record.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setValue('officer_name', 'Sub-Insp. Manoj Tiwari (DEMO)');
    setValue('staff_id', 'RPF-DLI-9923');
    setValue('designation', 'RPF Safety Squad Sub-Inspector');
    setValue('duty_date', new Date().toISOString().split('T')[0]);
    setValue('shift', 'AFTERNOON');
    setValue('assigned_train_or_area', 'Train 12302 / Kanpur Central');
    setValue('coach', 'AC Coaches A1-B3');
    setValue('duty_start_time', '14:00');
    setValue('duty_end_time', '22:00');
    setValue('contact_number', '9811223344');
    setValue('status', 'ON_DUTY');
    setValue('is_demo', true);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Bar with Back and Logout */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/staff')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Staff Portal</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-farm-900 bg-farm-50 px-3 py-1 rounded-xl border border-farm-200">
            RPF Escort Officer (Demo Session)
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

      {/* Live Train SOS Emergency Dispatch Monitor */}
      <OfficerEmergencyNotification
        assignedTrain={assignedTrain}
        onChangeAssignedTrain={setAssignedTrain}
        officerName={officerName}
      />

      {/* Page Header */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-farm-100 text-farm-800 border border-farm-200">
              Operations Roster
            </span>
            <span className="text-xs bg-harvest-100 text-harvest-900 border border-harvest-300 px-2 py-0.5 rounded-md font-bold">
              DEMO DATA
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1.5">
            Officer Duty Registration
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Log escort staff, station controllers, and security duty shifts for algorithmic incident matching.
          </p>
        </div>

        <button
          type="button"
          onClick={handleFillDemo}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-farm-50 hover:bg-farm-100 text-farm-800 border border-farm-200 text-xs font-semibold rounded-2xl transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-harvest-600" />
          <span>Fill Sample Officer</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-medium flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-farm-50 border-farm-200 text-farm-900'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-farm-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Registration Form */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <UserCheck className="w-4 h-4 text-farm-600" />
          <h2 className="font-bold text-sm text-slate-900">
            Log On-Duty Staff Member
          </h2>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Officer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Sub-Insp. R. K. Yadav (DEMO)"
                {...register('officer_name')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
              />
              {errors.officer_name && (
                <p className="text-red-600 mt-1">{errors.officer_name.message}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Staff / Badge Identifier <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. RPF-NDLS-4412"
                {...register('staff_id')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
              />
              {errors.staff_id && (
                <p className="text-red-600 mt-1">{errors.staff_id.message}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. RPF Escort Sub-Inspector"
                {...register('designation')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
              />
              {errors.designation && (
                <p className="text-red-600 mt-1">{errors.designation.message}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Assigned Train or Sector <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Train 12004 / New Delhi Platform 4"
                {...register('assigned_train_or_area')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
              />
              {errors.assigned_train_or_area && (
                <p className="text-red-600 mt-1">{errors.assigned_train_or_area.message}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Coach Sector (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Coaches C1-C4"
                {...register('coach')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Duty Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('duty_date')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Duty Shift
              </label>
              <select
                {...register('shift')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
              >
                <option value="MORNING">Morning Shift (06:00 - 14:00)</option>
                <option value="AFTERNOON">Afternoon Shift (14:00 - 22:00)</option>
                <option value="NIGHT">Night Shift (22:00 - 06:00)</option>
                <option value="FULL_DAY">Full Day Coverage (08:00 - 20:00)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Shift Hours (Start - End)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="time"
                  {...register('duty_start_time')}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
                />
                <input
                  type="time"
                  {...register('duty_end_time')}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                placeholder="10-digit mobile"
                {...register('contact_number')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-600 font-medium">
              * Registered duties are persisted in the database and surfaced as potential responders.
            </span>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-farm-600 hover:bg-farm-700 text-white text-xs font-bold rounded-2xl shadow-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              {submitting ? 'Registering...' : 'Register Duty Roster'}
            </button>
          </div>
        </form>
      </div>

      {/* On-Duty Officers Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900">
            Current On-Duty Roster ({officers.length})
          </h3>
          <span className="text-[11px] text-slate-600 font-medium">
            Status: Active ON_DUTY Personnel
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F9FBF9] text-farm-900 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-3">Duty ID</th>
                <th className="py-3 px-3">Officer Name</th>
                <th className="py-3 px-3">Staff ID</th>
                <th className="py-3 px-3">Designation</th>
                <th className="py-3 px-3">Assigned Train / Area</th>
                <th className="py-3 px-3">Shift</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {officers.map((off) => (
                <tr key={off.duty_id} className="hover:bg-[#F9FBF9] transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{off.duty_id}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {off.officer_name}
                    {off.is_demo && (
                      <span className="ml-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-harvest-100 text-harvest-900 border border-harvest-200">
                        DEMO
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700 font-medium">{off.staff_id}</td>
                  <td className="py-3 px-3 text-slate-900 font-medium">{off.designation}</td>
                  <td className="py-3 px-3 font-semibold text-farm-800">
                    {off.assigned_train_or_area} {off.coach ? `(${off.coach})` : ''}
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {off.shift} ({off.duty_start_time} - {off.duty_end_time})
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-900 font-semibold">
                    {off.contact_number ? `+91 ${off.contact_number}` : '—'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-farm-100 text-farm-900 border border-farm-300">
                      {off.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

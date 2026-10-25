import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Users, Train, Calendar, Plus, Trash2, Shield, Sparkles, RotateCcw, CheckCircle2 } from 'lucide-react';
import { JourneyCreate } from '../../types';

const journeySchema = z.object({
  traveler_type: z.enum(['SOLO', 'GROUP']),
  primary_passenger: z.object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters'),
    mobile_number: z
      .string()
      .regex(/^[5-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
    age: z.coerce.number().min(1, 'Age must be at least 1').max(120, 'Age must be at most 120'),
    gender: z.string().optional(),
    emergency_contact_name: z.string().optional(),
    emergency_contact_mobile: z.string().optional()
  }),
  group_members: z.array(
    z.object({
      member_id: z.string(),
      full_name: z.string().min(2, 'Name must be at least 2 characters'),
      relationship: z.string().min(1, 'Relationship is required'),
      age: z.coerce.number().min(0).max(120).optional(),
      gender: z.string().optional(),
      assistance_needs: z.string().optional()
    })
  ),
  train_number: z.string().min(3, 'Train number is required (e.g. 12004)'),
  train_name: z.string().optional(),
  boarding_station: z.string().min(2, 'Boarding station is required'),
  destination_station: z.string().min(2, 'Destination station is required'),
  journey_date: z.string().min(8, 'Journey date is required'),
  coach: z.string().optional(),
  seat: z.string().optional(),
  expected_arrival_time: z.string().optional()
}).refine(
  (data) => data.boarding_station.trim().toLowerCase() !== data.destination_station.trim().toLowerCase(),
  {
    message: 'Destination station cannot be the same as boarding station',
    path: ['destination_station']
  }
);

type JourneyFormData = z.infer<typeof journeySchema>;

export const DEMO_SOLO_PROFILE: JourneyCreate = {
  traveler_type: 'SOLO',
  primary_passenger: {
    full_name: 'Rajesh Sharma',
    mobile_number: '9876543210',
    age: 29,
    gender: 'Male',
    emergency_contact_name: 'Kavita Sharma',
    emergency_contact_mobile: '9876501234'
  },
  group_members: [],
  train_number: '12951',
  train_name: 'Mumbai Tejas Rajdhani Express',
  boarding_station: 'New Delhi (NDLS)',
  destination_station: 'Mumbai Central (BCT)',
  journey_date: new Date().toISOString().split('T')[0],
  coach: 'B3',
  seat: '42',
  expected_arrival_time: '08:35'
};

export const DEMO_FAMILY_PROFILE: JourneyCreate = {
  traveler_type: 'GROUP',
  primary_passenger: {
    full_name: 'Priya Patel',
    mobile_number: '9811223344',
    age: 36,
    gender: 'Female',
    emergency_contact_name: 'Amit Patel',
    emergency_contact_mobile: '9822334455'
  },
  group_members: [
    {
      member_id: 'fam-child-1',
      full_name: 'Aarav Patel',
      relationship: 'Son',
      age: 7,
      gender: 'Male',
      assistance_needs: 'Child care vigilance'
    },
    {
      member_id: 'fam-senior-2',
      full_name: 'Shanti Patel',
      relationship: 'Mother (Senior Citizen)',
      age: 68,
      gender: 'Female',
      assistance_needs: 'Wheelchair / Elderly assistance'
    }
  ],
  train_number: '12004',
  train_name: 'Lucknow Swarna Shatabdi Express',
  boarding_station: 'New Delhi (NDLS)',
  destination_station: 'Lucknow Jn (LJN)',
  journey_date: new Date().toISOString().split('T')[0],
  coach: 'C2',
  seat: '24',
  expected_arrival_time: '12:40'
};

const DEFAULT_BLANK_VALUES: JourneyFormData = {
  traveler_type: 'SOLO',
  primary_passenger: {
    full_name: '',
    mobile_number: '',
    age: 28,
    gender: 'Male',
    emergency_contact_name: '',
    emergency_contact_mobile: ''
  },
  group_members: [],
  train_number: '',
  train_name: '',
  boarding_station: '',
  destination_station: '',
  journey_date: new Date().toISOString().split('T')[0],
  coach: '',
  seat: '',
  expected_arrival_time: ''
};

interface JourneyFormProps {
  onSubmit: (data: JourneyCreate) => Promise<void>;
  isLoading: boolean;
  prefillData?: JourneyCreate | null;
}

export const JourneyRegistrationForm: React.FC<JourneyFormProps> = ({
  onSubmit,
  isLoading,
  prefillData
}) => {
  const [travelerType, setTravelerType] = useState<'SOLO' | 'GROUP'>('SOLO');
  const [draftRestored, setDraftRestored] = useState<boolean>(false);

  const getInitialValues = (): JourneyFormData => {
    if (prefillData) {
      return prefillData as JourneyFormData;
    }
    try {
      const savedDraft = localStorage.getItem('railrakshak_journey_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === 'object') {
          return parsed as JourneyFormData;
        }
      }
    } catch {}
    return DEFAULT_BLANK_VALUES;
  };

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<JourneyFormData>({
    resolver: zodResolver(journeySchema),
    defaultValues: getInitialValues()
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'group_members'
  });

  // Check if draft was restored on initial load
  useEffect(() => {
    const savedDraft = localStorage.getItem('railrakshak_journey_draft');
    if (savedDraft && !prefillData) {
      setDraftRestored(true);
    }
  }, []);

  // Sync prefillData when clicked from outside
  useEffect(() => {
    if (prefillData) {
      reset(prefillData as JourneyFormData);
      setTravelerType(prefillData.traveler_type);
      try {
        localStorage.setItem('railrakshak_journey_draft', JSON.stringify(prefillData));
      } catch {}
    }
  }, [prefillData, reset]);

  // Automatically save draft on form change
  const currentValues = watch();
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentValues && (currentValues.primary_passenger?.full_name || currentValues.train_number)) {
        try {
          localStorage.setItem('railrakshak_journey_draft', JSON.stringify(currentValues));
        } catch {}
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [currentValues]);

  const handleTravelerTypeChange = (type: 'SOLO' | 'GROUP') => {
    setTravelerType(type);
    setValue('traveler_type', type);
    if (type === 'SOLO') {
      setValue('group_members', []);
    } else if (fields.length === 0) {
      append({
        member_id: `mem-${Date.now()}`,
        full_name: '',
        relationship: 'Family Member',
        age: 30,
        gender: 'Female',
        assistance_needs: 'None'
      });
    }
  };

  const handleApplyProfile = (profile: JourneyCreate) => {
    reset(profile as JourneyFormData);
    setTravelerType(profile.traveler_type);
    try {
      localStorage.setItem('railrakshak_journey_draft', JSON.stringify(profile));
    } catch {}
    setDraftRestored(false);
  };

  const handleClearDraft = () => {
    localStorage.removeItem('railrakshak_journey_draft');
    reset(DEFAULT_BLANK_VALUES);
    setTravelerType('SOLO');
    setDraftRestored(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Top Banner with Quick Actions & Draft Status */}
      <div className="bg-[#F9FBF9] p-5 rounded-3xl border border-emerald-100 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                Journey & Passenger Details
              </h2>
              {draftRestored && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-farm-800 bg-farm-50 px-2.5 py-0.5 rounded-full border border-farm-200">
                  <CheckCircle2 className="w-3 h-3 text-farm-600" />
                  Saved draft restored
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Your entries are automatically saved. Backing up or refreshing will not lose your details.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleApplyProfile(DEMO_SOLO_PROFILE)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-farm-50 text-farm-800 border border-farm-200 text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-farm-600" />
              <span>Fill Solo Demo</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyProfile(DEMO_FAMILY_PROFILE)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-harvest-50 text-harvest-900 border border-harvest-300 text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-harvest-700" />
              <span>Fill Family Demo</span>
            </button>

            <button
              type="button"
              onClick={handleClearDraft}
              title="Clear entered details"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 hover:text-red-600 hover:bg-white rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Traveler Type Selector */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
          Traveler Type
        </label>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => handleTravelerTypeChange('SOLO')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-sm font-semibold transition-all cursor-pointer ${
              travelerType === 'SOLO'
                ? 'bg-farm-600 text-white border-farm-600 shadow-sm'
                : 'bg-[#F9FBF9] text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Solo Traveler</span>
          </button>

          <button
            type="button"
            onClick={() => handleTravelerTypeChange('GROUP')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-sm transition-all cursor-pointer ${
              travelerType === 'GROUP'
                ? 'bg-harvest-400 text-slate-950 font-bold border-harvest-500 shadow-sm'
                : 'bg-[#F9FBF9] text-slate-700 font-semibold border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Family / Group</span>
          </button>
        </div>
      </div>

      {/* Primary Passenger Form */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-farm-600" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              {travelerType === 'GROUP' ? 'Family / Group Lead Details' : 'Passenger Details'}
            </h3>
          </div>
          <span className="text-[11px] text-slate-600 font-semibold">* Required</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Rajesh Sharma"
              {...register('primary_passenger.full_name')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
            />
            {errors.primary_passenger?.full_name && (
              <p className="text-xs text-red-600 font-medium mt-1">
                {errors.primary_passenger.full_name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="10-digit mobile (e.g. 9876543210)"
              {...register('primary_passenger.mobile_number')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
            />
            {errors.primary_passenger?.mobile_number && (
              <p className="text-xs text-red-600 font-medium mt-1">
                {errors.primary_passenger.mobile_number.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 29"
              {...register('primary_passenger.age')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
            />
            {errors.primary_passenger?.age && (
              <p className="text-xs text-red-600 font-medium mt-1">
                {errors.primary_passenger.age.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Gender (Optional)
            </label>
            <select
              {...register('primary_passenger.gender')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other / Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Emergency Contact Name (Optional)
            </label>
            <input
              type="text"
              placeholder="Contact person name"
              {...register('primary_passenger.emergency_contact_name')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Emergency Contact Mobile (Optional)
            </label>
            <input
              type="tel"
              placeholder="Emergency mobile number"
              {...register('primary_passenger.emergency_contact_mobile')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
            />
          </div>
        </div>
      </div>

      {/* Group Members Section (if Group selected) */}
      {travelerType === 'GROUP' && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-harvest-600" />
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Family / Group Companions
              </h3>
            </div>
            <button
              type="button"
              onClick={() =>
                append({
                  member_id: `mem-${Date.now()}`,
                  full_name: '',
                  relationship: 'Family Member',
                  age: 25,
                  gender: 'Female',
                  assistance_needs: 'None'
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-harvest-50 hover:bg-harvest-100 text-harvest-800 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-harvest-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Companion</span>
            </button>
          </div>

          {fields.length === 0 ? (
            <p className="text-xs text-slate-600 italic py-2">
              No additional companions added. Click "Add Companion" to add family members.
            </p>
          ) : (
            <div className="space-y-3">
              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="p-4 rounded-2xl bg-[#F9FBF9] border border-emerald-100 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-800">
                      Companion #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="text-red-600 hover:text-red-700 p-1 text-xs font-medium cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Companion Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Aarav Patel"
                        {...register(`group_members.${idx}.full_name` as const)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Relationship *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Son / Mother / Spouse"
                        {...register(`group_members.${idx}.relationship` as const)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Special Assistance Needs
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Wheelchair / Senior / Infant"
                        {...register(`group_members.${idx}.assistance_needs` as const)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Journey & Train Details */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Train className="w-4 h-4 text-farm-600" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              Train & Journey Information
            </h3>
          </div>
          <span className="text-[11px] text-slate-600 font-semibold">* Required</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Train Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 12951 or 12004"
              {...register('train_number')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
            />
            {errors.train_number && (
              <p className="text-xs text-red-600 font-medium mt-1">{errors.train_number.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Train Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Mumbai Tejas Rajdhani"
              {...register('train_name')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Boarding Station <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. New Delhi (NDLS)"
              {...register('boarding_station')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
            />
            {errors.boarding_station && (
              <p className="text-xs text-red-600 font-medium mt-1">{errors.boarding_station.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Destination Station <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Mumbai Central (BCT)"
              {...register('destination_station')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
            />
            {errors.destination_station && (
              <p className="text-xs text-red-600 font-medium mt-1">{errors.destination_station.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Journey Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('journey_date')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Coach & Seat (Optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Coach (e.g. B3)"
                {...register('coach')}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-mono text-slate-900"
              />
              <input
                type="text"
                placeholder="Seat (e.g. 42)"
                {...register('seat')}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-mono text-slate-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-9 py-4 bg-farm-600 hover:bg-farm-700 active:bg-farm-800 text-white font-bold text-sm rounded-2xl shadow-lg shadow-farm-700/20 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 transform hover:scale-[1.01] active:scale-[0.99]"
        >
          {isLoading ? 'Registering Journey...' : 'Save Journey & Open Safety Dashboard'}
        </button>
      </div>
    </form>
  );
};

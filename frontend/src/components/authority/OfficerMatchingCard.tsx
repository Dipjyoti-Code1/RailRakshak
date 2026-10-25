import React, { useEffect, useState } from 'react';
import { UserCheck, Shield, Clock, AlertTriangle, PhoneCall } from 'lucide-react';
import { OfficerMatchResponse } from '../../types';
import { api } from '../../api/client';

interface OfficerMatchingProps {
  incidentId: string;
}

export const OfficerMatchingCard: React.FC<OfficerMatchingProps> = ({ incidentId }) => {
  const [matches, setMatches] = useState<OfficerMatchResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const fetchMatches = async () => {
      try {
        const data = await api.getPotentialOfficers(incidentId);
        if (mounted) setMatches(data);
      } catch {
        if (mounted) setMatches([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchMatches();
    return () => {
      mounted = false;
    };
  }, [incidentId]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-3 shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-farm-600" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
            Potential On-Duty Officer Matches
          </h4>
        </div>
        <span className="text-[10px] text-harvest-700 bg-harvest-50 px-2.5 py-0.5 rounded-full font-semibold border border-harvest-200">
          Algorithmic Potential Match
        </span>
      </div>

      <div className="bg-farm-50/70 p-3 rounded-2xl border border-farm-200/70 text-[11px] text-farm-900">
        <span className="font-semibold block mb-0.5">Operational Guidance:</span>
        Matches are computed from officer duty rosters matching reported train numbers or operational sectors. A match is <strong>not</strong> a confirmed assignment or verified dispatch.
      </div>

      {loading ? (
        <div className="text-xs text-slate-600 font-medium py-3 text-center">Checking on-duty officers...</div>
      ) : matches.length === 0 ? (
        <div className="text-xs text-slate-600 font-medium py-4 text-center">
          No active officer roster matches found for this train or route sector.
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((m, idx) => (
            <div
              key={idx}
              className="bg-[#F9FBF9] p-3.5 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{m.officer.officer_name}</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-300 text-slate-700 font-medium">
                    {m.officer.staff_id}
                  </span>
                  {m.officer.is_demo && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-harvest-100 text-harvest-900 border border-harvest-200">
                      DEMO
                    </span>
                  )}
                </div>
                <div className="text-slate-600 text-[11px] mt-0.5 font-medium">
                  {m.officer.designation} • Shift: {m.officer.shift} ({m.officer.duty_start_time} - {m.officer.duty_end_time})
                </div>
                <div className="text-farm-700 font-semibold text-[11px] mt-1">
                  Reason: {m.match_reason}
                </div>
              </div>

              {m.officer.contact_number && (
                <div className="flex items-center gap-1.5 self-start sm:self-center font-mono text-xs text-slate-800 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                  <PhoneCall className="w-3.5 h-3.5 text-farm-600" />
                  <span>+91 {m.officer.contact_number}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

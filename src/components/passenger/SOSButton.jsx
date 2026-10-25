import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, ShieldAlert, X, Loader2, Navigation, AlertTriangle } from 'lucide-react';

export default function SOSButton({ onTriggerSOS, isSubmitting }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleOpenConfirm = () => {
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    setShowConfirmModal(false);
    onTriggerSOS();
  };

  return (
    <div className="w-full">
      {/* Big prominent SOS Button */}
      <button
        type="button"
        onClick={handleOpenConfirm}
        disabled={isSubmitting}
        className="relative w-full group overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-red-700 to-red-600 p-1 text-white shadow-xl shadow-red-900/30 hover:shadow-2xl hover:shadow-red-900/40 focus:outline-none focus:ring-4 focus:ring-red-500/50 active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
      >
        <div className="relative flex items-center justify-center gap-3 sm:gap-4 py-4 sm:py-5 px-6 rounded-xl bg-red-600 group-hover:bg-red-600/90 transition-colors">
          <div className="relative">
            <span className="absolute -inset-1 rounded-full bg-white/20 animate-ping" />
            <AlertOctagon className="w-7 h-7 sm:w-8 sm:h-8 text-white relative flex-shrink-0" />
          </div>
          <div className="text-left">
            <span className="block font-black text-lg sm:text-2xl tracking-wider uppercase text-white drop-shadow-sm">
              🚨 SOS — SEND EMERGENCY ALERT
            </span>
            <span className="block text-xs sm:text-sm font-medium text-red-100 opacity-90">
              Immediate distress beacon for railway security & assistance
            </span>
          </div>
        </div>
      </button>

      {/* Confirmation Modal to prevent accidental triggers */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-red-200 overflow-hidden">
            {/* Header */}
            <div className="bg-red-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-6 h-6 text-amber-300" />
                <h3 className="font-extrabold text-lg">Confirm Emergency Alert</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="text-red-100 hover:text-white p-1 rounded-lg hover:bg-red-700/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start gap-3.5 mb-5">
                <div className="p-2.5 rounded-full bg-red-100 text-red-600 flex-shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base mb-1">
                    Are you experiencing an immediate emergency?
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Pressing confirm will transmit an urgent distress alert with your journey information and current GPS coordinates to the Authority Control Room.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 mb-6">
                <span className="font-bold block mb-1">Notice for Demonstration Platform:</span>
                This web platform operates as a prototype simulation. Real-world railway police, emergency contacts, or railway officials are not notified unless integrated.
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel / False Alarm
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <AlertOctagon className="w-4 h-4" />
                  Confirm & Broadcast SOS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

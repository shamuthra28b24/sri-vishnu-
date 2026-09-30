import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Clock,
  Lock,
  Smartphone,
  HardDrive,
  Bell,
  Building,
  Save,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { User } from '../types';

interface SettingsViewProps {
  currentUser: User;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentUser, showToast }) => {
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [minPasswordLength, setMinPasswordLength] = useState(8);
  const [require2FAForManagers, setRequire2FAForManagers] = useState(true);
  const [backupSchedule, setBackupSchedule] = useState('Daily (02:00 AM)');
  const [maxUploadSizeMB, setMaxUploadSizeMB] = useState(50);
  const [autoPurgeRecycleDays, setAutoPurgeRecycleDays] = useState(30);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('System configuration & security policies updated successfully.', 'success');
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans'] max-w-4xl">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
              Administrator Governance
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-amber-400" />
            <span>System & Security Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure enterprise security policies, session timeouts, automated backups, and file ingestion parameters.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Company Information */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200 pb-2 border-b border-slate-800">
            <Building className="w-4 h-4 text-amber-400" />
            <span>Company Information</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Enterprise Legal Name</label>
              <input
                type="text"
                disabled
                value="Sri Vishnu Heat Treaters"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Plant Location</label>
              <input
                type="text"
                disabled
                value="SIDCO Industrial Estate, Coimbatore, Tamil Nadu - 641021"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Security & Authentication Policies */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200 pb-2 border-b border-slate-800">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Security & Authentication Policies</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Session Inactivity Timeout (Minutes)</label>
              <input
                type="number"
                min="5"
                max="480"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Minimum Password Length (bcrypt)</label>
              <input
                type="number"
                min="8"
                max="32"
                value={minPasswordLength}
                onChange={(e) => setMinPasswordLength(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={require2FAForManagers}
                  onChange={(e) => setRequire2FAForManagers(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Mandate Two-Factor Authentication (2FA) for Admin & Quality Managers</span>
              </label>
            </div>
          </div>
        </div>

        {/* File Storage & Backup Settings */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200 pb-2 border-b border-slate-800">
            <HardDrive className="w-4 h-4 text-amber-400" />
            <span>Storage & Automated Backup Configuration</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Max Document Upload Size (MB)</label>
              <input
                type="number"
                value={maxUploadSizeMB}
                onChange={(e) => setMaxUploadSizeMB(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Recycle Bin Auto-Purge Retention (Days)</label>
              <input
                type="number"
                value={autoPurgeRecycleDays}
                onChange={(e) => setAutoPurgeRecycleDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Automated AES Backup Snapshot Frequency</label>
              <select
                value={backupSchedule}
                onChange={(e) => setBackupSchedule(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
              >
                <option value="Hourly">Every 6 Hours</option>
                <option value="Daily (02:00 AM)">Daily at 02:00 AM (Recommended)</option>
                <option value="Weekly">Weekly on Sunday</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save System Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};

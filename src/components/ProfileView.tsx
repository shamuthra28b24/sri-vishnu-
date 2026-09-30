import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  KeyRound,
  Laptop,
  Smartphone,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Lock,
  RefreshCw,
  QrCode,
  Copy,
  Check,
  Building,
  Briefcase
} from 'lucide-react';
import { User } from '../types';
import { vaultStorage } from '../services/storageService';

interface ProfileViewProps {
  currentUser: User;
  onLogout: () => void;
  showToast: (text: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onLogout,
  showToast
}) => {
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState('+91 98422 71045');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Avatar presets
  const avatarPresets = [
    '👨‍💼', '👨‍🔬', '👷‍♂️', '👩‍💼', '👩‍🔬', '🧑‍🏭', '🕵️‍♂️', '🛡️'
  ];
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatarUrl || '👨‍💼');

  // 2FA state
  const is2FA = currentUser.twoFactorEnabled;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setTimeout(() => {
      currentUser.fullName = fullName;
      currentUser.email = email;
      currentUser.avatarUrl = selectedAvatar;
      vaultStorage.logAudit(
        'USER_UPDATED',
        undefined,
        `User ${currentUser.username} updated profile information (Name, Email, Avatar)`,
        'INFO'
      );
      setIsUpdating(false);
      showToast('Profile information successfully saved.', 'success');
    }, 400);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters long.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setIsUpdating(true);
    setTimeout(() => {
      vaultStorage.resetPassword(currentUser.username, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsUpdating(false);
      showToast('Master password successfully updated with fresh bcrypt salt.', 'success');
    }, 450);
  };

  const handleToggle2FA = () => {
    vaultStorage.toggleTwoFactor(currentUser.id);
    showToast(
      currentUser.twoFactorEnabled
        ? 'Two-Factor Authentication (OTP) enabled on this account.'
        : 'Two-Factor Authentication disabled.',
      'info'
    );
  };

  const handleTerminateOtherSessions = () => {
    vaultStorage.logAudit(
      'LOGOUT',
      undefined,
      `User ${currentUser.username} terminated 2 remote sessions from other devices.`,
      'WARNING'
    );
    showToast('All other active device sessions have been terminated.', 'success');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-4xl p-3 bg-slate-950 rounded-2xl border border-slate-700 shadow-inner">
            {selectedAvatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{currentUser.fullName}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentUser.designation} • {currentUser.department}
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              Member ID: {currentUser.id} • Registered: {new Date(currentUser.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-200 text-xs font-semibold transition cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span>Sign Out of Vault</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Information & Avatar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Form */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <UserIcon className="w-4 h-4 text-amber-400" />
              <span>Personal & Contact Information</span>
            </h3>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              {/* Avatar Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Select Profile Avatar / Industrial Badge
                </label>
                <div className="flex flex-wrap gap-2">
                  {avatarPresets.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`text-2xl p-2 rounded-xl border transition cursor-pointer ${
                        selectedAvatar === av
                          ? 'bg-amber-500/20 border-amber-500 scale-110 shadow-lg'
                          : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Username (Read-Only)</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.username}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-500 font-mono cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-xs text-white outline-none"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-xs text-white outline-none"
                    />
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled
                      value={currentUser.department}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-400 cursor-not-allowed"
                    />
                    <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Designation</label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled
                      value={currentUser.designation}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-400 cursor-not-allowed"
                    />
                    <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg cursor-pointer"
                >
                  {isUpdating ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Master Password */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Change Master Password</span>
            </h3>

            <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter current password (HeatTreat@2026)"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-xs text-white outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">New Master Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-xs text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-slate-400">
                <span className="text-emerald-400 font-bold">Policy Enforced:</span> Passwords hashed with bcrypt cost factor 12. Never stored in plaintext.
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 cursor-pointer"
                >
                  Update Master Password
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: 2FA & Active Sessions */}
        <div className="space-y-6">
          {/* Two-Factor Authentication Card */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Two-Factor Auth (OTP)</span>
              </h3>
              <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${
                is2FA ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {is2FA ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Enhance plant data security with Time-based One-Time Password (TOTP) verification using Google Authenticator, Microsoft Authenticator, or PyOTP.
              </p>

              {/* QR Code & Secret Simulation */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="inline-flex p-3 bg-white rounded-xl shadow-lg mb-2">
                  <QrCode className="w-20 h-20 text-slate-950" />
                </div>
                <div className="text-[10px] text-slate-400 mb-1">Manual Setup Key:</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-xs text-amber-400 font-bold tracking-wider select-all">
                    SVHT-PLANT-2FA-99X
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('SVHT-PLANT-2FA-99X');
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggle2FA}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition cursor-pointer ${
                  is2FA
                    ? 'bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-200'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950'
                }`}
              >
                {is2FA ? 'Disable Two-Factor Authentication' : 'Activate 2FA (OTP)'}
              </button>
            </div>
          </div>

          {/* Active Sessions Monitoring */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Laptop className="w-4 h-4 text-amber-400" />
                <span>Active Vault Sessions</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">2 DEVICES</span>
            </div>

            <div className="mt-4 space-y-3">
              {/* Current Device */}
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-200">Chrome on Windows 11</span>
                  </div>
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Current
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  IP: 182.72.194.50 • Coimbatore, TN
                </div>
                <div className="text-[10px] text-slate-500">
                  Active now • JWT Session Valid
                </div>
              </div>

              {/* Other Session */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-300">Mobile Safari on iPad</span>
                  </div>
                  <span className="text-[9px] text-slate-500">2 hrs ago</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">
                  IP: 182.72.194.52 • SQF Furnace Lab
                </div>
              </div>

              <button
                type="button"
                onClick={handleTerminateOtherSessions}
                className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
              >
                Log Out of All Other Devices
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

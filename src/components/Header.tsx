import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  Flame,
  UserCheck,
  KeyRound,
  Bell,
  RefreshCw,
  LogOut,
  ChevronDown,
  Lock,
  FileCheck,
  Info
} from 'lucide-react';
import { vaultStorage } from '../services/storageService';
import { User, UserRole, NotificationItem } from '../types';

interface HeaderProps {
  currentUser: User;
  onOpenUpload: () => void;
  onNavigate: (view: string) => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenUpload,
  onNavigate,
  onOpenNotifications,
  unreadNotificationsCount,
  onLogout
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [otpMsg, setOtpMsg] = useState<{ text: string; success: boolean } | null>(null);

  const users = vaultStorage.getUsers();
  const alerts = vaultStorage.getSecurityAlerts().filter((a) => a.status === 'NEW' || a.status === 'INVESTIGATING');
  const jwtToken = vaultStorage.getJwtToken();

  const handleSwitchUser = (userId: string) => {
    vaultStorage.switchUser(userId);
    setShowUserDropdown(false);
  };

  const handleToggle2FA = () => {
    vaultStorage.toggleTwoFactor(currentUser.id);
    setOtpMsg({
      text: currentUser.twoFactorEnabled
        ? 'Two-Factor Authentication (TOTP) has been disabled.'
        : 'Two-Factor Authentication (TOTP) has been successfully activated.',
      success: true
    });
  };

  const roleColors: Record<UserRole, { badge: string; border: string; bg: string }> = {
    Admin: { badge: 'bg-red-500/20 text-red-300 border-red-500/40', border: 'border-red-500/50', bg: 'bg-red-950/40' },
    Manager: { badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', border: 'border-amber-500/50', bg: 'bg-amber-950/40' },
    Employee: { badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40', border: 'border-blue-500/50', bg: 'bg-blue-950/40' },
    Viewer: { badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', border: 'border-emerald-500/50', bg: 'bg-emerald-950/40' },
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 lg:px-6 py-3 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          {/* Company Branding */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 shadow-lg shadow-orange-950/50 border border-amber-400/40">
              <Flame className="w-6 h-6 text-amber-100 animate-pulse" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center" title="AES-256-GCM Active">
                <Lock className="w-2.5 h-2.5 text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg lg:text-xl tracking-tight text-white font-['Space_Grotesk']">
                  SRI VISHNU <span className="text-amber-400">HEAT TREATERS</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  AES-256 Vault
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Secure File Storage Management System • ISO 9001 / IATF 16949 Metallurgical Vault
              </p>
            </div>
          </div>

          {/* Quick Actions & User Center */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Upload Action Button */}
            {currentUser.role !== 'Viewer' && (
              <button
                onClick={onOpenUpload}
                className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-semibold text-xs transition shadow-md shadow-orange-950/40 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Upload & Encrypt</span>
              </button>
            )}

            {/* Notification Center Bell */}
            <button
              onClick={onOpenNotifications}
              className={`relative p-2 rounded-lg border transition cursor-pointer ${
                unreadNotificationsCount > 0
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 hover:bg-amber-900/50'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
              }`}
              title="Notification Center"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950 animate-bounce">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* JWT Token Inspector */}
            <button
              onClick={() => setShowTokenModal(true)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-300 transition cursor-pointer"
              title="Inspect Current JWT Session Token"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-mono">JWT Session</span>
            </button>

            {/* Quick Switch Role / User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition ${roleColors[currentUser.role].bg} ${roleColors[currentUser.role].border} cursor-pointer hover:brightness-110`}
              >
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-300">
                  {currentUser.fullName.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5 leading-tight">
                    <span>{currentUser.fullName}</span>
                    <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-mono font-bold border ${roleColors[currentUser.role].badge}`}>
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight truncate max-w-[120px]">
                    {currentUser.designation}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Switcher Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-800 mb-2">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Role for Testing (Capstone Demo)
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Instantly test RBAC permissions as any persona
                    </p>
                  </div>

                  <div className="space-y-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleSwitchUser(u.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition cursor-pointer ${
                          u.id === currentUser.id
                            ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                            : 'hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-slate-200">{u.fullName}</div>
                          <div className="text-[10px] text-slate-400">{u.designation}</div>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border ${roleColors[u.role].badge}`}>
                          {u.role}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShow2FAModal(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800/80 cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      <span>Configure 2FA (OTP)</span>
                      {currentUser.twoFactorEnabled && (
                        <span className="ml-auto text-[10px] text-emerald-400 font-bold">ACTIVE</span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        if (confirm('Reset document vault and users to default clean state?')) {
                          vaultStorage.resetToFactory();
                        }
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-300 hover:bg-rose-950/40 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
                      <span>Reset Vault to Clean State</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        if (onLogout) {
                          onLogout();
                        } else {
                          vaultStorage.logout();
                        }
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-amber-300 hover:bg-amber-950/40 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-amber-400" />
                      <span>Sign Out to Login Portal</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Header Sign Out Button */}
            <button
              onClick={() => {
                if (onLogout) {
                  onLogout();
                } else {
                  vaultStorage.logout();
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-red-950/60 hover:text-red-300 hover:border-red-500/40 border border-slate-700/80 text-xs text-slate-300 transition cursor-pointer"
              title="Sign Out to Login Portal (Test Credentials & 2FA)"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* JWT Session Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-slate-100">Active JWT Session Token</h3>
              </div>
              <button
                onClick={() => setShowTokenModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Encoded Bearer Token:</label>
                <div className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-amber-300 break-all border border-slate-800 max-h-24 overflow-y-auto">
                  {jwtToken}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Decoded Payload Claims:</label>
                <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-emerald-400 border border-slate-800 space-y-1">
                  <div>"sub": "{currentUser.id}"</div>
                  <div>"username": "{currentUser.username}"</div>
                  <div>"role": "{currentUser.role}"</div>
                  <div>"department": "{currentUser.department}"</div>
                  <div>"full_name": "{currentUser.fullName}"</div>
                  <div>"algorithm": "HS256"</div>
                  <div>"two_factor": {currentUser.twoFactorEnabled ? 'true' : 'false'}</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  All requests to download or modify files require this JWT in the Authorization header. Role permissions are enforced both in-flight and at the storage layer.
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTokenModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Configuration Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-slate-100">Two-Factor Authentication (2FA)</h3>
              </div>
              <button
                onClick={() => setShow2FAModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <div className="font-semibold text-xs text-slate-200">TOTP Status</div>
                  <div className="text-[11px] text-slate-400">
                    {currentUser.twoFactorEnabled ? 'Currently Enabled (PyOTP / Authenticator)' : 'Currently Disabled'}
                  </div>
                </div>
                <button
                  onClick={handleToggle2FA}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    currentUser.twoFactorEnabled
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  }`}
                >
                  {currentUser.twoFactorEnabled ? 'Deactivate 2FA' : 'Enable 2FA'}
                </button>
              </div>

              {currentUser.twoFactorEnabled && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs text-slate-400">Authenticator Secret Key (Base32):</div>
                  <div className="font-mono text-xs text-amber-400 bg-slate-900 p-2 rounded border border-slate-800">
                    {currentUser.twoFactorSecret || 'SVHT-FURNACE-2FA-METALLURGY'}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Compatible with Google Authenticator, Microsoft Authenticator, and PyOTP.
                  </p>
                </div>
              )}

              {otpMsg && (
                <div className={`p-2.5 rounded-lg text-xs border ${otpMsg.success ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-red-500/10 text-red-300 border-red-500/30'}`}>
                  {otpMsg.text}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShow2FAModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

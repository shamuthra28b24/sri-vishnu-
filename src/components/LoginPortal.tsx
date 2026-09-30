import React, { useState, useEffect } from 'react';
import {
  Flame,
  Lock,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  Smartphone,
  RefreshCw,
  Clock,
  Sparkles,
  Unlock,
  Shield,
  Layers,
  FileCheck2,
  Database,
  Building,
  Check
} from 'lucide-react';
import { vaultStorage } from '../services/storageService';
import { User, UserRole } from '../types';

interface LoginPortalProps {
  onLoginSuccess: (user: User) => void;
  onBypass?: () => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onLoginSuccess, onBypass }) => {
  const users = vaultStorage.getUsers();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('HeatTreat@2026');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 2FA state
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [step, setStep] = useState<'credentials' | 'twoFactor' | 'roleVerification'>('credentials');
  const [otpCode, setOtpCode] = useState('');
  const [simulatedTotp, setSimulatedTotp] = useState('849201');
  const [timerCountdown, setTimerCountdown] = useState(30);

  // Password reset state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetUsername, setResetUsername] = useState('admin');
  const [newPassword, setNewPassword] = useState('HeatTreat@2026');
  const [resetSuccess, setResetSuccess] = useState(false);

  // TOTP simulation timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerCountdown((prev) => {
        if (prev <= 1) {
          const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
          setSimulatedTotp(randomCode);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectPersona = (u: User) => {
    setUsername(u.username);
    setPassword('HeatTreat@2026');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const result = vaultStorage.authenticateUser(username, password);

      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed');
        return;
      }

      if (result.requires2FA && result.user) {
        setPendingUser(result.user);
        setStep('twoFactor');
        setOtpCode('');
      } else if (result.user) {
        initiateRoleVerification(result.user);
      }
    }, 450);
  };

  const handleTestIncorrectPassword = () => {
    setErrorMessage(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const result = vaultStorage.authenticateUser(username, 'WrongPassword_Test!99');
      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed');
      }
    }, 300);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser) return;

    if (!otpCode || otpCode.length < 6) {
      setErrorMessage('Please enter a valid 6-digit TOTP verification code.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const result = vaultStorage.verifyOTP(pendingUser.id, otpCode);
      if (result.success) {
        initiateRoleVerification(pendingUser);
      } else {
        setErrorMessage(result.error || 'Invalid OTP code.');
      }
    }, 400);
  };

  const initiateRoleVerification = (user: User) => {
    setStep('roleVerification');
    setTimeout(() => {
      vaultStorage.completeLogin(user);
      onLoginSuccess(user);
    }, 750);
  };

  const handleUnlockCurrent = (userId: string) => {
    vaultStorage.unlockAccount(userId);
    setErrorMessage(null);
    setSuccessMessage('Account unlocked successfully by administrator policy. You may now sign in.');
  };

  const currentUserObj = users.find((u) => u.username === username);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-['Plus_Jakarta_Sans'] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Split-Screen Container */}
      <div className="w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 z-10 backdrop-blur-xl">
        {/* LEFT SIDE (Section 38 specification: Sri Vishnu Heat Treaters, Secure File Storage Management System, Protecting Your Industrial Documents) */}
        <div className="lg:col-span-5 p-8 lg:p-10 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle industrial heat treatment watermark */}
          <div className="absolute -bottom-10 -right-10 opacity-10 pointer-events-none">
            <Flame className="w-64 h-64 text-amber-500" />
          </div>

          <div>
            {/* Company Logo & Branding */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 shadow-xl shadow-orange-950/60 border border-amber-400/40 flex items-center justify-center">
                <Flame className="w-7 h-7 text-white animate-pulse" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white font-['Space_Grotesk'] block leading-none">
                  SRI VISHNU
                </span>
                <span className="text-xs font-bold text-amber-400 tracking-wider uppercase font-['Space_Grotesk']">
                  HEAT TREATERS
                </span>
              </div>
            </div>

            {/* Title & Slogan */}
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Secure File Storage Management System
            </h1>
            <p className="text-sm text-amber-400 font-semibold mt-2">
              Protecting Your Industrial Documents
            </p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Enterprise cryptographic platform engineered for metallurgical quality certificates, gas carburizing heat cycles, CQI-9 pyrometry surveys, and customer CAD specifications.
            </p>

            {/* Key Security Pillars */}
            <div className="mt-8 space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <div className="p-1 rounded bg-amber-500/20 text-amber-400 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span><strong>AES-256-GCM Encryption</strong> at rest with authenticated tags</span>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-0.5">
                  <FileCheck2 className="w-3.5 h-3.5" />
                </div>
                <span><strong>SHA-256 File Integrity</strong> with tamper-detection lab</span>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <div className="p-1 rounded bg-blue-500/20 text-blue-400 mt-0.5">
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <span><strong>Role-Based Access Control</strong> (Admin, Manager, Employee, Auditor)</span>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <div className="p-1 rounded bg-purple-500/20 text-purple-400 mt-0.5">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <span><strong>Two-Factor Authentication</strong> (RFC 6238 TOTP)</span>
              </div>
            </div>
          </div>

          {/* Plant Status Indicator */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Coimbatore Plant Status</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                ALL 7 SQF UNITS ONLINE
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              ISO 9001:2015 • IATF 16949 • CQI-9 Pyrometry Standards
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (Section 38 specification: Welcome Back, Email / Username, Password, Remember Me, LOGIN, Forgot Password) */}
        <div className="lg:col-span-7 p-8 lg:p-10 flex flex-col justify-between">
          <div>
            {/* Quick Persona Switcher for Evaluation */}
            <div className="mb-6 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Select Persona for Evaluation
                </span>
                <span className="text-[10px] text-slate-500 font-mono">1-Click Auto Fill</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {users.slice(0, 4).map((u) => {
                  const isSelected = username === u.username;
                  const roleBadge =
                    u.role === 'Admin'
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : u.role === 'Manager'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : u.role === 'Employee'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectPersona(u)}
                      className={`p-2 rounded-xl text-left transition border cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500/60 shadow-md shadow-amber-950/40'
                          : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.2 rounded border ${roleBadge}`}>
                          {u.role}
                        </span>
                        {u.twoFactorEnabled && (
                          <span className="text-[9px] text-amber-400 font-mono" title="2FA Active">
                            2FA
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-slate-200 mt-1 truncate">{u.fullName.split(' ')[0]}</div>
                      <div className="text-[10px] text-slate-500 font-mono">@{u.username}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Header: Welcome Back */}
            <div className="mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials to access the secure document vault
              </p>
            </div>

            {/* Status Alert Banner */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{errorMessage}</p>
                  {currentUserObj?.isLocked && (
                    <div className="mt-2 pt-2 border-t border-red-500/30 flex items-center justify-between">
                      <span className="text-[11px] text-red-300">Account locked due to 3 failures.</span>
                      <button
                        type="button"
                        onClick={() => handleUnlockCurrent(currentUserObj.id)}
                        className="px-2.5 py-1 rounded bg-red-800/80 hover:bg-red-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Unlock className="w-3 h-3" />
                        Admin Unlock
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Step 1: Credentials */}
            {step === 'credentials' && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                {/* Username Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email / Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. admin or karthik_qa"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-100 text-xs sm:text-sm transition font-mono outline-none"
                    />
                    {currentUserObj && (
                      <span className="absolute right-3 top-2.5 text-[10px] text-slate-400 font-sans">
                        {currentUserObj.role} • {currentUserObj.department.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowResetModal(true)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-100 text-xs sm:text-sm transition font-mono outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Default password: <span className="font-mono text-amber-400">HeatTreat@2026</span>
                  </p>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                    />
                    <span>Remember Me</span>
                  </label>

                  <div className="text-[10px] font-mono text-slate-500">
                    bcrypt cost 12
                  </div>
                </div>

                {/* Submit Button [ LOGIN ] */}
                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-sm tracking-wide uppercase transition shadow-lg shadow-orange-950/50 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    ) : (
                      <>
                        <span>LOGIN</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Test Failed Password Button */}
                  <button
                    type="button"
                    onClick={handleTestIncorrectPassword}
                    disabled={isLoading}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-red-500/30 text-red-300 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Simulate 3 incorrect attempts to test lockout and Security Center alert"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    <span>Test Failed Password (Test Account Lockout & Security Alert)</span>
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Two-Factor Authentication (OTP) */}
            {step === 'twoFactor' && pendingUser && (
              <form onSubmit={handleOtpSubmit} className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span>Two-Factor Authentication (OTP)</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono">2FA REQUIRED</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
                  <p className="font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    Two-Factor Authentication is active for {pendingUser.fullName} ({pendingUser.role}).
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Please enter the 6-digit Time-Based One-Time Password (TOTP) from your authenticator app.
                  </p>
                </div>

                {/* Simulated Authenticator Live OTP Display */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <span>Simulated Authenticator:</span>
                    <span className="flex items-center gap-1 text-amber-400 font-mono">
                      <Clock className="w-3 h-3" />
                      Expires in {timerCountdown}s
                    </span>
                  </div>

                  <div className="text-3xl font-extrabold tracking-widest font-mono text-amber-400 select-all">
                    {simulatedTotp.slice(0, 3)} {simulatedTotp.slice(3)}
                  </div>

                  <div className="mt-3 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpCode(simulatedTotp)}
                      className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold cursor-pointer"
                    >
                      Auto-Fill OTP ({simulatedTotp})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                        setSimulatedTotp(newCode);
                        setTimerCountdown(30);
                      }}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Generate New Code"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* OTP Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-center">
                    Enter 6-Digit TOTP Token
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[0.5em] text-xl font-bold py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white transition outline-none font-mono"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('credentials');
                      setErrorMessage(null);
                    }}
                    className="w-1/3 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-2/3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs sm:text-sm transition shadow-lg cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP & Enter Vault'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Role & Permission Verification Animation */}
            {step === 'roleVerification' && (
              <div className="py-8 text-center space-y-4 animate-in fade-in">
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
                <h3 className="text-base font-bold text-white">Initializing Zero-Trust Session...</h3>
                <div className="space-y-1 text-xs text-slate-400 font-mono">
                  <p>✓ bcrypt Master Credential Hash Validated</p>
                  <p>✓ Two-Factor OTP Time-based Token Verified</p>
                  <p>✓ Issuing Signed JWT Session Token (HS256)</p>
                  <p className="text-amber-400 font-bold">
                    ✓ Loading RBAC Policy for role: {pendingUser?.role || currentUserObj?.role}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Info & Demo Bypass */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div>IP: 182.72.194.50 • Coimbatore, TN</div>
            {onBypass && (
              <button
                type="button"
                onClick={onBypass}
                className="text-amber-400/80 hover:text-amber-400 hover:underline cursor-pointer"
              >
                Skip to Dashboard (Demo Mode) →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-100">Reset Vault Master Password</h3>
              </div>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetSuccess(false);
                }}
                className="text-slate-400 hover:text-slate-200 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {resetSuccess ? (
              <div className="mt-4 space-y-4">
                <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs">
                  <p className="font-semibold">Password Reset Successful!</p>
                  <p className="mt-1 text-slate-300">
                    A secure password reset event has been recorded in the Audit Log and master credentials updated.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetSuccess(false);
                  }}
                  className="w-full py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Target Username:</label>
                  <select
                    value={resetUsername}
                    onChange={(e) => setResetUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.username}>
                        {u.fullName} (@{u.username} - {u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">New Master Password:</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Must meet plant password complexity policy: minimum 8 characters.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="w-1/2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      vaultStorage.resetPassword(resetUsername, newPassword);
                      setResetSuccess(true);
                    }}
                    className="w-1/2 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                  >
                    Reset & Apply Hash
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

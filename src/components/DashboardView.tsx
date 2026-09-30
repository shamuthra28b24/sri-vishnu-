import React, { useState } from 'react';
import {
  FolderLock,
  HardDrive,
  Users,
  ShieldAlert,
  CheckCircle2,
  FileCheck2,
  UploadCloud,
  FileText,
  Clock,
  ArrowRight,
  Flame,
  AlertTriangle,
  Lock,
  Download,
  Eye,
  CheckCircle,
  ShieldCheck,
  Bell,
  Calendar,
  Sparkles,
  BarChart3,
  TrendingUp,
  FolderPlus,
  UserPlus,
  FilePlus,
  Shield,
  Activity,
  Check,
  ChevronRight,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { DocumentFile, User, SecurityAlert, AuditLog, DocumentCategory } from '../types';

interface DashboardViewProps {
  files: DocumentFile[];
  currentUser: User;
  alerts: SecurityAlert[];
  auditLogs: AuditLog[];
  onNavigate: (view: string) => void;
  onOpenUpload: () => void;
  onSelectFile: (file: DocumentFile) => void;
  onDownloadFile: (file: DocumentFile) => void;
  onOpenCreateFolder?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  files,
  currentUser,
  alerts,
  auditLogs,
  onNavigate,
  onOpenUpload,
  onSelectFile,
  onDownloadFile,
  onOpenCreateFolder
}) => {
  const activeFiles = files.filter((f) => !f.isDeleted);
  const pendingApprovals = activeFiles.filter((f) => f.approvalStatus === 'Pending Review');
  const activeAlerts = alerts.filter((a) => a.status === 'NEW' || a.status === 'INVESTIGATING');
  const tamperedFiles = activeFiles.filter((f) => f.integrityStatus === 'Tampered');

  // Chart tabs
  const [activeChartTab, setActiveChartTab] = useState<'activity' | 'storage' | 'filetypes' | 'monthly'>('activity');

  // Documents expiring soon
  const expiringDocuments = [
    { title: 'Calibration Certificate - Pyrometer SQF #1', daysLeft: 3, cat: 'Calibration Certificates', color: 'text-red-400' },
    { title: 'Customer Quality Agreement - Sundram Fasteners', daysLeft: 7, cat: 'Customer Documents', color: 'text-amber-400' },
    { title: 'TUV IATF 16949 Surveillance Inspection Report', daysLeft: 12, cat: 'Inspection Reports', color: 'text-amber-400' },
    { title: 'Furnace Operator CQI-9 Training Certificate', daysLeft: 20, cat: 'Employee Records', color: 'text-emerald-400' }
  ];

  // Recent files
  const recentFiles = [...activeFiles].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 24. DASHBOARD HEADER */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              INDUSTRIAL METALLURGICAL VAULT
            </span>
            <span className="text-xs text-slate-400 font-mono">ISO 9001:2015 & IATF 16949</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Sri Vishnu Heat Treaters
          </h1>
          <p className="text-xs text-amber-400 font-semibold tracking-wide">
            Secure File Storage Management System
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-300 pt-1">
            <span>
              Welcome, <strong className="text-white">{currentUser.fullName}</strong> ({currentUser.role})
            </span>
            <span>•</span>
            <span className="text-slate-400 font-mono">
              Last Login: Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Quick Header Indicators & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('security')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-semibold hover:bg-slate-900 transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Security: 86 / 100</span>
          </button>

          <button
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <UserIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>Profile</span>
          </button>
        </div>
      </div>

      {/* 32. QUICK ACTIONS BAR */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pl-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Quick Actions:
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {currentUser.role !== 'Viewer' && (
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>+ Upload Document</span>
            </button>
          )}

          {currentUser.role !== 'Viewer' && (
            <button
              onClick={() => onNavigate('documents')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Create Folder</span>
            </button>
          )}

          {currentUser.role === 'Admin' && (
            <button
              onClick={() => onNavigate('users')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-400" />
              <span>+ Add User</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('analytics')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
            <span>+ Create Report</span>
          </button>

          {currentUser.role !== 'Viewer' && (
            <button
              onClick={() => onNavigate('approvals')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Request Approval</span>
            </button>
          )}
        </div>
      </div>

      {/* 24. DASHBOARD SUMMARY CARDS (Cards 1 to 6 as specified) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Total Documents */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Documents</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <FolderLock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white font-['Space_Grotesk']">2,458</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">+12 this week</div>
          </div>
        </div>

        {/* Card 2: Encrypted Files */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Encrypted Files</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white font-['Space_Grotesk']">2,301</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">93.6% Protected</div>
          </div>
        </div>

        {/* Card 3: Pending Approvals */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pending Approvals</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white font-['Space_Grotesk']">18</div>
            <div className="text-[11px] text-orange-400 font-semibold mt-0.5">Requires Action</div>
          </div>
        </div>

        {/* Card 4: Storage Used */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Storage Used</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white font-['Space_Grotesk']">68.4 GB</div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">of 100 GB</div>
          </div>
        </div>

        {/* Card 5: Expiring Documents */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Expiring Documents</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white font-['Space_Grotesk']">12</div>
            <div className="text-[11px] text-amber-400 font-semibold mt-0.5">Within 30 Days</div>
          </div>
        </div>

        {/* Card 6: Security Alerts */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Security Alerts</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white font-['Space_Grotesk']">4</div>
            <div className="text-[11px] text-red-400 font-semibold mt-0.5">Requires Attention</div>
          </div>
        </div>
      </div>

      {/* 25. DASHBOARD ANALYTICS SECTION & 26. SECURITY CENTER WIDGET */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Analytics Charts (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>Dashboard Analytics & Trends</span>
              </h3>
              <p className="text-xs text-slate-400">Ingestion activity, storage distributions, and file metrics</p>
            </div>

            {/* Chart Selectors */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveChartTab('activity')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  activeChartTab === 'activity' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Activity
              </button>
              <button
                onClick={() => setActiveChartTab('storage')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  activeChartTab === 'storage' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Storage
              </button>
              <button
                onClick={() => setActiveChartTab('filetypes')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  activeChartTab === 'filetypes' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                File Types
              </button>
              <button
                onClick={() => setActiveChartTab('monthly')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  activeChartTab === 'monthly' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Active Chart View */}
          {activeChartTab === 'activity' && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Uploads vs Downloads vs Updates (Weekly Volume)</span>
                <span className="text-amber-400">Peak: 142 Ops / Day</span>
              </div>
              <div className="h-44 flex items-end gap-3 sm:gap-6 pt-4 px-2 border-b border-slate-800">
                {[
                  { day: 'Mon', up: 85, down: 45, upd: 12 },
                  { day: 'Tue', up: 110, down: 62, upd: 20 },
                  { day: 'Wed', up: 130, down: 88, upd: 15 },
                  { day: 'Thu', up: 95, down: 70, upd: 25 },
                  { day: 'Fri', up: 142, down: 95, upd: 30 },
                  { day: 'Sat', up: 60, down: 40, upd: 8 },
                  { day: 'Sun', up: 25, down: 15, upd: 4 }
                ].map((item) => (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="w-full flex items-end gap-1 justify-center h-full">
                      <div className="w-2.5 bg-amber-500 rounded-t" style={{ height: `${(item.up / 150) * 100}%` }} title={`Uploads: ${item.up}`}></div>
                      <div className="w-2.5 bg-blue-500 rounded-t" style={{ height: `${(item.down / 150) * 100}%` }} title={`Downloads: ${item.down}`}></div>
                      <div className="w-2.5 bg-purple-500 rounded-t" style={{ height: `${(item.upd / 150) * 100}%` }} title={`Updates: ${item.upd}`}></div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{item.day}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded"></span> Uploads</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded"></span> Downloads</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-purple-500 rounded"></span> Updates</span>
              </div>
            </div>
          )}

          {activeChartTab === 'storage' && (
            <div className="space-y-4 pt-2">
              <div className="text-xs text-slate-400 font-mono">Departmental Storage Allocation Breakdown (GB)</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { dept: 'Production (SQF)', size: '24.2 GB', pct: 35, color: 'bg-amber-500' },
                  { dept: 'Quality Assurance', size: '18.6 GB', pct: 27, color: 'bg-emerald-500' },
                  { dept: 'Customer Documents', size: '12.4 GB', pct: 18, color: 'bg-blue-500' },
                  { dept: 'Employee Records', size: '6.2 GB', pct: 9, color: 'bg-purple-500' },
                  { dept: 'Maintenance & Spares', size: '4.8 GB', pct: 7, color: 'bg-rose-500' },
                  { dept: 'Other & Legal', size: '2.2 GB', pct: 4, color: 'bg-slate-500' }
                ].map((item) => (
                  <div key={item.dept} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="truncate pr-1">{item.dept}</span>
                      <span className="font-mono font-bold">{item.pct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                      <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${item.pct}%` }}></div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">{item.size}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeChartTab === 'filetypes' && (
            <div className="space-y-4 pt-2">
              <div className="text-xs text-slate-400 font-mono">File Format Distribution</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { type: 'PDF Certificates', count: '1,420 files', pct: '58%', color: 'border-red-500/40 text-red-300' },
                  { type: 'DOCX / SOPs', count: '380 files', pct: '15%', color: 'border-blue-500/40 text-blue-300' },
                  { type: 'XLSX / Heat Logs', count: '410 files', pct: '17%', color: 'border-emerald-500/40 text-emerald-300' },
                  { type: 'JPG / Microstructure', count: '120 files', pct: '5%', color: 'border-amber-500/40 text-amber-300' },
                  { type: 'PNG / CAD Diagrams', count: '85 files', pct: '3%', color: 'border-purple-500/40 text-purple-300' },
                  { type: 'Other Formats', count: '43 files', pct: '2%', color: 'border-slate-500/40 text-slate-300' }
                ].map((item) => (
                  <div key={item.type} className={`p-3 rounded-xl bg-slate-950 border ${item.color}`}>
                    <div className="text-xs font-bold text-white">{item.type}</div>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                      <span>{item.count}</span>
                      <span className="font-mono font-bold">{item.pct}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeChartTab === 'monthly' && (
            <div className="space-y-4 pt-2">
              <div className="text-xs text-slate-400 font-mono">Monthly Ingest Volume (January - June 2026)</div>
              <div className="h-44 flex items-end gap-4 pt-4 px-2 border-b border-slate-800">
                {[
                  { month: 'Jan', count: 320, pct: 60 },
                  { month: 'Feb', count: 390, pct: 75 },
                  { month: 'Mar', count: 440, pct: 85 },
                  { month: 'Apr', count: 410, pct: 80 },
                  { month: 'May', count: 490, pct: 95 },
                  { month: 'Jun', count: 520, pct: 100 }
                ].map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full bg-gradient-to-t from-orange-600 to-amber-500 rounded-t" style={{ height: `${m.pct}%` }} title={`${m.month}: ${m.count} documents`}></div>
                    <span className="text-[10px] text-slate-400 font-mono">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: 26. DASHBOARD SECURITY CENTER WIDGET (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>SECURITY CENTER</span>
              </h3>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                HEALTHY
              </span>
            </div>

            {/* Score Ring Display */}
            <div className="my-5 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-center">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Security Score
              </div>
              <div className="text-4xl font-extrabold text-emerald-400 font-['Space_Grotesk'] tracking-tight">
                86 <span className="text-sm font-normal text-slate-500">/ 100</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Industrial Plant Cyber-Risk Level: LOW</p>
            </div>

            {/* Security Checklist Widget (Section 26 specification) */}
            <div className="space-y-2 text-xs divide-y divide-slate-800/60 font-medium">
              <div className="pt-1 flex items-center justify-between text-slate-300">
                <span>Password Security</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">✓ Enforced</span>
              </div>
              <div className="pt-2 flex items-center justify-between text-slate-300">
                <span>2FA Enabled</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">✓ Active</span>
              </div>
              <div className="pt-2 flex items-center justify-between text-slate-300">
                <span>Encryption (AES-256)</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">✓ 100% Files</span>
              </div>
              <div className="pt-2 flex items-center justify-between text-slate-300">
                <span>Backup</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">✓ Scheduled</span>
              </div>
              <div className="pt-2 flex items-center justify-between text-slate-300">
                <span>Suspicious Activity</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">⚠ 1 Monitored</span>
              </div>
              <div className="pt-2 flex items-center justify-between text-slate-300">
                <span>Expired Documents</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">⚠ 3 Actionable</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800">
            <button
              onClick={() => onNavigate('security')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>View Security Details</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 27. RECENT ACTIVITY & 28. SECURITY ALERTS & 31. EXPIRY ALERT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 27. RECENT ACTIVITY WIDGET */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>Recent Activity</span>
            </h4>
            <button onClick={() => onNavigate('audit')} className="text-[11px] text-amber-400 hover:underline cursor-pointer">
              View All
            </button>
          </div>

          <div className="space-y-3">
            <div className="text-xs p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="font-semibold text-slate-200">Admin uploaded Quality_Report.pdf</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">5 minutes ago • IP: 182.72.194.50</div>
            </div>
            <div className="text-xs p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="font-semibold text-slate-200">Manager approved Batch_Record.pdf</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">12 minutes ago • SQF Division</div>
            </div>
            <div className="text-xs p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="font-semibold text-slate-200">Employee downloaded Furnace_Report.pdf</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">20 minutes ago • Lab Cell</div>
            </div>
            <div className="text-xs p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="font-semibold text-slate-200">Admin created a new user account</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">35 minutes ago • Role: Employee</div>
            </div>
          </div>
        </div>

        {/* 28. SECURITY ALERT WIDGET */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Security Alert Widget</span>
            </h4>
            <button onClick={() => onNavigate('security')} className="text-[11px] text-amber-400 hover:underline cursor-pointer">
              Manage
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="text-xs p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">⚠ Multiple failed login attempts</div>
                <div className="text-[10px] text-red-300/80">4 invalid attempts from external IP 185.220.101.5</div>
              </div>
            </div>

            <div className="text-xs p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">⚠ 3 documents are expiring soon</div>
                <div className="text-[10px] text-amber-300/80">Calibration certificates due for re-test</div>
              </div>
            </div>

            <div className="text-xs p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">⚠ Unusual download activity detected</div>
                <div className="text-[10px] text-amber-300/80">Bulk access request flagged by policy engine</div>
              </div>
            </div>

            <div className="text-xs p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">✓ Backup completed successfully</div>
                <div className="text-[10px] text-emerald-300/80">Daily snapshot written to encrypted storage</div>
              </div>
            </div>
          </div>
        </div>

        {/* 31. EXPIRY ALERT WIDGET */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Documents Expiring Soon</span>
            </h4>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              ACTION REQUIRED
            </span>
          </div>

          <div className="space-y-2.5">
            {expiringDocuments.map((doc, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                <div className="truncate pr-2">
                  <div className="font-semibold text-slate-200 truncate">{doc.title}</div>
                  <div className="text-[10px] text-slate-500">{doc.cat}</div>
                </div>
                <span className={`font-mono font-bold text-xs px-2 py-1 rounded bg-slate-900 border border-slate-700 shrink-0 ${doc.color}`}>
                  {doc.daysLeft} Days
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 29. PENDING APPROVAL WIDGET & 30. RECENT DOCUMENTS WIDGET */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 29. PENDING APPROVAL WIDGET */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Pending Approvals</span>
              </h3>
              <p className="text-xs text-slate-400">Department documents awaiting review by Manager</p>
            </div>
            <button
              onClick={() => onNavigate('approvals')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Approvals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-medium uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Document</th>
                  <th className="py-2.5 px-3">Uploaded By</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-100">Batch_Record_SQF_4412.pdf</td>
                  <td className="py-3 px-3 text-slate-300">suresh_op (Operator)</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                      Pending
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onNavigate('approvals')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-sans text-[11px] font-bold cursor-pointer"
                    >
                      Review
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-100">Quality_Report_Shaft_20MnCr5.pdf</td>
                  <td className="py-3 px-3 text-slate-300">anitha_lab (Chemist)</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                      Pending
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onNavigate('approvals')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-sans text-[11px] font-bold cursor-pointer"
                    >
                      Review
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-100">Inspection_Sundram_DriveGear.pdf</td>
                  <td className="py-3 px-3 text-slate-300">suresh_op (Operator)</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                      Pending
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onNavigate('approvals')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-sans text-[11px] font-bold cursor-pointer"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 30. RECENT DOCUMENTS WIDGET */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Recent Documents</span>
              </h3>
              <p className="text-xs text-slate-400">Recently updated metallurgical vault files</p>
            </div>
            <button
              onClick={() => onNavigate('documents')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Files</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentFiles.map((file) => (
              <div
                key={file.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-[10px] text-amber-400 shrink-0">
                    {file.fileExtension.toUpperCase()}
                  </div>
                  <div className="truncate">
                    <div
                      onClick={() => onSelectFile(file)}
                      className="font-semibold text-xs text-slate-200 hover:text-amber-400 cursor-pointer truncate"
                    >
                      {file.fileName}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {file.category} • {(file.fileSizeBytes / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>

                {/* Actions: View, Download, Details (Section 30 requirement) */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onSelectFile(file)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                    title="View & Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDownloadFile(file)}
                    className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition cursor-pointer"
                    title="Download Decrypted"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

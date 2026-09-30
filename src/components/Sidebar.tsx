import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  FolderLock,
  Layers,
  Trash2,
  CheckCircle2,
  ShieldAlert,
  FileCheck2,
  History,
  Flame,
  Wrench,
  FileCheck,
  Building,
  Users2,
  Share2,
  Clock,
  HardDriveDownload,
  Bell,
  User as UserIcon,
  Settings,
  LogOut,
  FolderTree,
  FileSpreadsheet
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  currentUser: User;
  pendingApprovalsCount: number;
  securityAlertsCount: number;
  deletedFilesCount: number;
  batchesCount: number;
  furnacesCount: number;
  onLogout?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  currentUser,
  pendingApprovalsCount,
  securityAlertsCount,
  deletedFilesCount,
  batchesCount,
  furnacesCount,
  onLogout,
  onOpenNotifications,
  unreadNotificationsCount = 0
}) => {
  const role = currentUser.role; // 'Admin' | 'Manager' | 'Employee' | 'Viewer'

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 h-[calc(100vh-61px)] sticky top-[61px] overflow-y-auto font-['Plus_Jakarta_Sans'] select-none">
      {/* Role Policy Header (shows active role badge) */}
      <div className="p-3 m-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-semibold text-slate-300">Active Role Policy</span>
          <span className="font-mono text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
            {role}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">
          {role === 'Admin' && 'Full administrator governance, audit, restore & purge permissions.'}
          {role === 'Manager' && 'Department document review, approval, versioning & team reporting.'}
          {role === 'Employee' && 'Authorized upload, view, permitted download & batch activity tracking.'}
          {role === 'Viewer' && 'Auditor read-only inspection access to certified quality documents.'}
        </p>
      </div>

      <div className="flex-1 px-3 space-y-4 pb-6">
        {/* 1. DASHBOARD */}
        <div>
          <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Dashboard
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectView('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => onSelectView('analytics')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentView === 'analytics'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>Analytics & Trends</span>
            </button>
          </div>
        </div>

        {/* 2. DOCUMENTS */}
        <div>
          <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Documents
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectView('documents')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentView === 'documents'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderLock className="w-4 h-4 text-amber-400" />
                <span>All Documents</span>
              </div>
            </button>

            <button
              onClick={() => onSelectView('categories')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentView === 'categories'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Categories</span>
              </div>
            </button>

            {role !== 'Employee' && role !== 'Viewer' && (
              <button
                onClick={() => onSelectView('recycle')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentView === 'recycle'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Recycle Bin</span>
                </div>
                {deletedFilesCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    {deletedFilesCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* 3. APPROVALS */}
        {role !== 'Viewer' && (
          <div>
            <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Approvals
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => onSelectView('approvals')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentView === 'approvals'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Approval Workflow</span>
                </div>
                {pendingApprovalsCount > 0 && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 4. SECURITY & COMPLIANCE */}
        <div>
          <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Security & Compliance
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectView('security')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentView === 'security'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>Security Center</span>
              </div>
              {securityAlertsCount > 0 && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                  {securityAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectView('integrity')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentView === 'integrity'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>File Integrity (SHA-256)</span>
            </button>

            {role !== 'Employee' && (
              <button
                onClick={() => onSelectView('audit')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentView === 'audit'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <History className="w-4 h-4 text-cyan-400" />
                <span>Audit Logs</span>
              </button>
            )}
          </div>
        </div>

        {/* 5. COMPANY RECORDS */}
        <div>
          <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Company Records
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectView('batches')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentView === 'batches'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Production Batches</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{batchesCount}</span>
            </button>

            <button
              onClick={() => onSelectView('furnaces')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentView === 'furnaces'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wrench className="w-4 h-4 text-orange-400" />
                <span>Furnace Records (CQI-9)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{furnacesCount}</span>
            </button>

            <button
              onClick={() => onSelectView('quality')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentView === 'quality'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Quality Records</span>
            </button>
          </div>
        </div>

        {/* 6. CUSTOMER DOCUMENTS */}
        <div>
          <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Customer Documents
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectView('customer')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentView === 'customer'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <Building className="w-4 h-4 text-blue-400" />
              <span>Customer Specifications</span>
            </button>
          </div>
        </div>

        {/* 7. MAINTENANCE */}
        {role !== 'Viewer' && (
          <div>
            <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Maintenance & Calibration
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => onSelectView('maintenance')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentView === 'maintenance'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Wrench className="w-4 h-4 text-teal-400" />
                <span>Equipment & Calibration</span>
              </button>
            </div>
          </div>
        )}

        {/* 8. ACCESS CONTROL (Admin only) */}
        {role === 'Admin' && (
          <div>
            <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Access Control
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => onSelectView('users')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentView === 'users'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Users2 className="w-4 h-4 text-blue-400" />
                <span>Users & Permissions</span>
              </button>
            </div>
          </div>
        )}

        {/* 9. SECURE SHARING & DOCUMENT CONTROL */}
        {role !== 'Viewer' && role !== 'Employee' && (
          <div>
            <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Document Governance
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => onSelectView('sharing')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentView === 'sharing'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Secure Sharing & Links</span>
              </button>

              <button
                onClick={() => onSelectView('doccontrol')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentView === 'doccontrol'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <FolderTree className="w-4 h-4 text-purple-400" />
                <span>Document Control</span>
              </button>
            </div>
          </div>
        )}

        {/* 10. SYSTEM & SETTINGS */}
        <div>
          <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            System
          </div>
          <div className="space-y-0.5">
            {role === 'Admin' && (
              <button
                onClick={() => onSelectView('backup')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentView === 'backup'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <HardDriveDownload className="w-4 h-4 text-teal-400" />
                <span>Backup & Recovery</span>
              </button>
            )}

            <button
              onClick={() => onSelectView('profile')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentView === 'profile'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <UserIcon className="w-4 h-4 text-amber-400" />
              <span>Profile & Sessions</span>
            </button>

            {role === 'Admin' && (
              <button
                onClick={() => onSelectView('settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentView === 'settings'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>System Settings</span>
              </button>
            )}
          </div>
        </div>

        {/* LOGOUT */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/40 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Secure Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

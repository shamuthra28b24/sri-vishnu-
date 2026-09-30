import React, { useState } from 'react';
import {
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Search,
  FileCheck2,
  HardDrive
} from 'lucide-react';
import { DocumentFile, User } from '../types';

interface MaintenanceViewProps {
  files: DocumentFile[];
  currentUser: User;
  onSelectFile: (file: DocumentFile) => void;
  onDownloadFile: (file: DocumentFile) => void;
  onOpenUpload: () => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  files,
  currentUser,
  onSelectFile,
  onDownloadFile,
  onOpenUpload
}) => {
  const [tab, setTab] = useState<'All' | 'Equipment' | 'Maintenance' | 'Calibration'>('All');
  const [search, setSearch] = useState('');

  const maintenanceFiles = files.filter(
    (f) => !f.isDeleted && (f.category === 'Maintenance Records' || f.category === 'Calibration Certificates' || f.category === 'Furnace Records')
  );

  const filtered = maintenanceFiles.filter((f) => {
    const match = f.fileName.toLowerCase().includes(search.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(search.toLowerCase()));
    if (!match) return false;
    if (tab === 'Calibration') return f.category === 'Calibration Certificates';
    if (tab === 'Maintenance') return f.category === 'Maintenance Records';
    if (tab === 'Equipment') return f.tags.includes('Equipment') || f.category === 'Furnace Records';
    return true;
  });

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans']">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
              Plant Maintenance & Metrology
            </span>
            <span className="text-xs text-slate-400 font-mono">CQI-9 Pyrometry & Sensor Calibration</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-emerald-400" />
            <span>Equipment, Maintenance & Calibration Records</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Digital tracking for furnace thermocouples, pyrometers, quench tank agitators, and refractory maintenance.
          </p>
        </div>

        {currentUser.role !== 'Viewer' && (
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition cursor-pointer flex items-center gap-2 self-start md:self-auto"
          >
            <span>+ Upload Calibration Record</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {(['All', 'Calibration', 'Maintenance', 'Equipment'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                tab === t
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t === 'All' ? 'All Metrology Records' : `${t} Records`}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="Search sensor, pyrometer, furnace ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-200 text-xs outline-none"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Record / Equipment</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Expiry / Calibration Due</th>
              <th className="py-3 px-4">Encryption (AES-256)</th>
              <th className="py-3 px-4">SHA-256 Hash</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {filtered.map((file) => (
              <tr key={file.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-100 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{file.fileName}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-sans">{file.description || 'CQI-9 Pyrometry Inspection'}</span>
                </td>
                <td className="py-3 px-4 text-slate-300 font-sans">{file.category}</td>
                <td className="py-3 px-4 font-sans">
                  {file.expiryDate ? (
                    <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {new Date(file.expiryDate).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-slate-500">Not Applicable</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    AES-256-GCM
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400 font-mono text-[10px]">
                  {file.sha256Hash.slice(0, 12)}...
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onSelectFile(file)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDownloadFile(file)}
                      className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 cursor-pointer"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

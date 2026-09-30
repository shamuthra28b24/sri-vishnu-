import React, { useState } from 'react';
import {
  Wrench,
  Flame,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HardDrive,
  FileCheck2,
  FileText,
  Thermometer,
  Eye,
  Sliders,
  Sparkles
} from 'lucide-react';
import { FurnaceRecord, FurnaceOperatingStatus, DocumentFile, User } from '../types';

interface FurnacesViewProps {
  furnaces: FurnaceRecord[];
  files: DocumentFile[];
  currentUser: User;
  onUpdateFurnace: (furnaceId: string, partial: Partial<FurnaceRecord>) => void;
  onSelectFile: (file: DocumentFile) => void;
  onOpenUpload: () => void;
}

export const FurnacesView: React.FC<FurnacesViewProps> = ({
  furnaces,
  files,
  currentUser,
  onUpdateFurnace,
  onSelectFile,
  onOpenUpload
}) => {
  const [selectedFurnace, setSelectedFurnace] = useState<FurnaceRecord | null>(null);

  const getStatusBadge = (status: FurnaceOperatingStatus) => {
    switch (status) {
      case 'Operational / Running':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Calibration Due':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse';
      case 'Under Maintenance':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getCalibrationCountdown = (nextCalibDate: string) => {
    const diff = Math.ceil((new Date(nextCalibDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: `Overdue by ${Math.abs(diff)} days`, color: 'text-rose-400 font-bold' };
    if (diff <= 15) return { label: `Expires in ${diff} days`, color: 'text-amber-400 font-bold' };
    return { label: `${diff} days remaining`, color: 'text-slate-300' };
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            Furnace Record & Pyrometry Calibration Management
          </h2>
          <p className="text-xs text-slate-400">
            AIAG CQI-9 Pyrometry Special Process & AMS 2750F Temperature Uniformity Survey (TUS) Tracking
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
        >
          <FileCheck2 className="w-4 h-4 text-emerald-400" />
          <span>Upload Calibration Cert</span>
        </button>
      </div>

      {/* Grid of Furnaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {furnaces.map((furnace) => {
          const calibInfo = getCalibrationCountdown(furnace.nextCalibrationDate);
          const attachedFiles = files.filter((f) => furnace.attachedDocIds.includes(f.id));

          return (
            <div
              key={furnace.id}
              className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                      {furnace.furnaceId}
                    </span>
                    <h3 className="font-bold text-base text-slate-100 mt-2">{furnace.furnaceName}</h3>
                    <div className="text-xs text-slate-400">{furnace.furnaceType} • Capacity: {furnace.capacityKg} kg</div>
                  </div>

                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${getStatusBadge(furnace.operatingStatus)}`}>
                    {furnace.operatingStatus}
                  </span>
                </div>

                {/* Technical Specs */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Operating Temperature:</span>
                    <span className="font-mono text-slate-200 font-semibold">{furnace.operatingTempRange}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">CQI-9 TUS Uniformity Spread:</span>
                    <span className="font-mono text-emerald-400 font-bold">±{furnace.temperatureUniformityDeviationC}°C (Class 2)</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Primary PID & Data Logger:</span>
                    <span className="text-slate-300 truncate max-w-[200px]">{furnace.primaryController}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-slate-500">Next Pyrometry Calibration:</span>
                    <div className="text-right">
                      <div className="font-mono text-slate-200 font-semibold">{furnace.nextCalibrationDate}</div>
                      <div className={`text-[10px] ${calibInfo.color}`}>{calibInfo.label}</div>
                    </div>
                  </div>
                </div>

                {/* Attached Compliance Certificates */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span>Attached TUS Surveys & Calibration Records ({attachedFiles.length})</span>
                    <span onClick={onOpenUpload} className="text-[10px] text-amber-400 hover:underline cursor-pointer">
                      + Attach Cert
                    </span>
                  </div>

                  {attachedFiles.length === 0 ? (
                    <div className="p-2 rounded bg-slate-950 text-slate-500 text-[11px] italic">
                      No certificates linked to this furnace.
                    </div>
                  ) : (
                    attachedFiles.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => onSelectFile(doc)}
                        className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/40 cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-slate-300 truncate max-w-[240px]">{doc.fileName}</div>
                          <div className="text-[10px] text-slate-500">SHA-256: {doc.sha256Hash.substring(0, 12)}...</div>
                        </div>
                        <Eye className="w-3.5 h-3.5 text-slate-400 hover:text-amber-400 shrink-0" />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Operating Status Selector */}
              {(currentUser.role === 'Admin' || currentUser.role === 'Manager') && (
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Update Operating Status:</span>
                  <select
                    value={furnace.operatingStatus}
                    onChange={(e) => onUpdateFurnace(furnace.id, { operatingStatus: e.target.value as FurnaceOperatingStatus })}
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Operational / Running">Operational / Running</option>
                    <option value="Idle / Standby">Idle / Standby</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Calibration Due">Calibration Due</option>
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

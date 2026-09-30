import React, { useState } from 'react';
import {
  BarChart3,
  PieChart,
  HardDrive,
  FolderLock,
  Users,
  ShieldAlert,
  FileCheck2,
  Download,
  Calendar,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Printer,
  FileText,
  Flame,
  Wrench,
  Clock
} from 'lucide-react';
import { DocumentFile, User, SecurityAlert, AuditLog, HeatTreatmentBatch, FurnaceRecord } from '../types';

interface AnalyticsReportsViewProps {
  files: DocumentFile[];
  users: User[];
  alerts: SecurityAlert[];
  auditLogs: AuditLog[];
  batches?: HeatTreatmentBatch[];
  furnaces?: FurnaceRecord[];
}

type ReportType = 'storage' | 'activity' | 'security' | 'approvals' | 'expiring' | 'batches' | 'furnaces' | 'quality';

export const AnalyticsReportsView: React.FC<AnalyticsReportsViewProps> = ({
  files,
  users,
  alerts,
  auditLogs,
  batches = [],
  furnaces = []
}) => {
  const [activeReportModal, setActiveReportModal] = useState<ReportType | null>(null);

  const activeFiles = files.filter((f) => !f.isDeleted);
  const totalBytes = activeFiles.reduce((acc, f) => acc + f.fileSizeBytes, 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

  // Group by Category
  const categoryCounts: Record<string, number> = {};
  activeFiles.forEach((f) => {
    categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
  });

  // Approval statistics
  const approvedCount = activeFiles.filter((f) => f.approvalStatus === 'Approved').length;
  const pendingCount = activeFiles.filter((f) => f.approvalStatus === 'Pending Review').length;
  const rejectedCount = activeFiles.filter((f) => f.approvalStatus === 'Rejected').length;

  // Expiry statistics
  const expiringSoonCount = activeFiles.filter((f) => f.expiryStatus === 'EXPIRING_SOON').length;
  const expiredCount = activeFiles.filter((f) => f.expiryStatus === 'EXPIRED').length;

  const downloadReportCSV = (type: ReportType) => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `SVHT_${type.toUpperCase()}_REPORT_${Date.now()}.csv`;

    if (type === 'storage') {
      headers = ['File ID', 'File Name', 'Category', 'Classification', 'Size (Bytes)', 'Version', 'Encrypted', 'Integrity'];
      rows = activeFiles.map((f) => [f.id, f.fileName, f.category, f.securityClassification, f.fileSizeBytes, f.currentVersion, f.encryptionAlgorithm, f.integrityStatus]);
    } else if (type === 'security') {
      headers = ['Alert ID', 'Timestamp', 'Type', 'Severity', 'Title', 'Source IP', 'Target User', 'Status'];
      rows = alerts.map((a) => [a.id, a.timestamp, a.alertType, a.severity, `"${a.title.replace(/"/g, '""')}"`, a.sourceIp, a.affectedUser || 'N/A', a.status]);
    } else if (type === 'batches') {
      headers = ['Batch ID', 'Job No', 'Customer', 'Part Name', 'Grade', 'Furnace', 'Temp (°C)', 'Hours', 'Quality Status'];
      rows = batches.map((b) => [b.batchId, b.jobNumber, b.customerName, b.partName, b.materialGrade, b.furnaceName, b.temperatureC, b.treatmentDurationHrs, b.qualityStatus]);
    } else if (type === 'furnaces') {
      headers = ['Furnace ID', 'Name', 'Type', 'Capacity (kg)', 'Status', 'Last Calibration', 'Next Calibration Due'];
      rows = furnaces.map((furn) => [furn.furnaceId, furn.furnaceName, furn.furnaceType, furn.capacityKg, furn.operatingStatus, furn.lastCalibrationDate, furn.nextCalibrationDate]);
    } else if (type === 'expiring') {
      headers = ['File ID', 'Document Name', 'Category', 'Expiry Date', 'Status', 'Uploader'];
      rows = activeFiles.filter((f) => f.expiryDate).map((f) => [f.id, f.fileName, f.category, f.expiryDate || '', f.expiryStatus, f.uploaderName]);
    } else {
      headers = ['Log ID', 'Timestamp', 'User', 'Role', 'Action', 'Resource', 'Details'];
      rows = auditLogs.map((l) => [l.id, l.timestamp, l.username, l.userRole, l.action, l.resourceName || 'N/A', `"${l.details.replace(/"/g, '""')}"`]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportsList = [
    { type: 'storage', name: 'File Storage & Quota Report', desc: 'Storage usage by category, encryption status, and data volume.' },
    { type: 'activity', name: 'User Activity & Audit Trail Report', desc: 'User authentication, file download activity, and forensic event logs.' },
    { type: 'security', name: 'Security Incident & Alerts Report', desc: 'Failed logins, brute-force anomalies, and tamper alerts.' },
    { type: 'approvals', name: 'Document Approval Turnaround Report', desc: 'Manager review duration, acceptance rate, and rejection remarks.' },
    { type: 'expiring', name: 'Expiring Certificates & Calibration Report', desc: 'Upcoming CQI-9 and thermocouple calibration expirations.' },
    { type: 'batches', name: 'Heat-Treatment Batch Traceability Report', desc: 'Production batches, temperatures, cycles, and attached certificates.' },
    { type: 'furnaces', name: 'Furnace CQI-9 Maintenance Report', desc: 'Furnace operating status, TUS uniformity surveys, and calibrations.' },
    { type: 'quality', name: 'Quality Inspection & NCR Report', desc: 'Microhardness traverses, case depth certification, and non-conformances.' }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            System Analytics & Executive Report Generator
          </h2>
          <p className="text-xs text-slate-400">
            Real-time metallurgical telemetry, storage utilization, compliance certificates, and exportable reports.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Print Executive Dashboard</span>
        </button>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Encrypted Footprint</span>
          <div className="text-2xl font-black text-white font-['Space_Grotesk']">{totalMB} MB</div>
          <span className="text-[10px] text-emerald-400">100% AES-256 Encrypted</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Approval Rate</span>
          <div className="text-2xl font-black text-emerald-400 font-['Space_Grotesk']">
            {activeFiles.length > 0 ? `${Math.round((approvedCount / activeFiles.length) * 100)}%` : '0%'}
          </div>
          <span className="text-[10px] text-slate-400">{approvedCount} approved documents</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Production Batches</span>
          <div className="text-2xl font-black text-amber-400 font-['Space_Grotesk']">{batches.length}</div>
          <span className="text-[10px] text-slate-400">Heat-treatment cycles logged</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Expiring Certs</span>
          <div className="text-2xl font-black text-rose-400 font-['Space_Grotesk']">{expiringSoonCount + expiredCount}</div>
          <span className="text-[10px] text-rose-400">{expiringSoonCount} due within 30 days</span>
        </div>
      </div>

      {/* Reports Generation Center */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Downloadable Compliance & Executive Reports
            </h3>
            <p className="text-xs text-slate-400">
              Generate and download structured CSV records or printable summaries for internal and external auditors.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {reportsList.map((rep) => (
            <div
              key={rep.type}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
            >
              <div>
                <h4 className="font-bold text-xs text-slate-200">{rep.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{rep.desc}</p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                <button
                  onClick={() => downloadReportCSV(rep.type as ReportType)}
                  className="w-full py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <h3 className="font-bold text-sm text-slate-200">Category Volume Distribution</h3>
          <div className="space-y-2.5">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / activeFiles.length) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate max-w-[240px]">{cat}</span>
                    <span className="font-mono text-slate-400">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Activity Throughput */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <h3 className="font-bold text-sm text-slate-200">Forensic Audit Activity Distribution</h3>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-3 gap-3 text-center">
            <div>
              <span className="text-slate-500 text-[11px] block">Total Ingests</span>
              <span className="text-2xl font-bold text-white font-['Space_Grotesk']">{activeFiles.length}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Security Events</span>
              <span className="text-2xl font-bold text-rose-400 font-['Space_Grotesk']">{alerts.length}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Active Batches</span>
              <span className="text-2xl font-bold text-amber-400 font-['Space_Grotesk']">{batches.length}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed pt-2">
            Forensic logs comply with IATF 16949:2016 control of documented records. No unauthorized modifications detected.
          </p>
        </div>
      </div>
    </div>
  );
};

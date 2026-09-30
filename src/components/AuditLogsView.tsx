import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  Shield,
  FileText,
  User,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import { AuditLog, AuditAction } from '../types';

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const actions: AuditAction[] = [
    'LOGIN_SUCCESS',
    'LOGIN_FAILED',
    'LOGOUT',
    'FILE_UPLOAD',
    'FILE_DOWNLOAD',
    'FILE_VERSION_UPLOAD',
    'FILE_APPROVE',
    'FILE_REJECT',
    'FILE_SOFT_DELETE',
    'FILE_RESTORE',
    'FILE_PERMANENT_DELETE',
    'PERMISSION_CHANGE',
    'USER_CREATED',
    'USER_UPDATED',
    'USER_DEACTIVATED',
    'INTEGRITY_CHECK_PASSED',
    'INTEGRITY_TAMPER_DETECTED',
    'SECURITY_ALERT_TRIGGERED',
    'BACKUP_EXPORT',
    'BACKUP_RESTORE'
  ];

  const filteredLogs = logs.filter((log) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchUser = log.username.toLowerCase().includes(q);
      const matchResource = log.resourceName?.toLowerCase().includes(q) || false;
      const matchDetails = log.details.toLowerCase().includes(q);
      const matchIp = log.ipAddress.includes(q);
      if (!matchUser && !matchResource && !matchDetails && !matchIp) return false;
    }

    if (selectedAction !== 'ALL' && log.action !== selectedAction) return false;
    if (selectedSeverity !== 'ALL' && log.severity !== selectedSeverity) return false;

    return true;
  });

  const exportCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'User ID', 'Username', 'Role', 'Action', 'Resource', 'IP Address', 'Severity', 'Details'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      l.userId,
      l.username,
      l.userRole,
      l.action,
      l.resourceName || 'N/A',
      l.ipAddress,
      l.severity,
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SVHT_Audit_Log_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SVHT_Audit_Log_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const severityBadge = (severity: AuditLog['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'WARNING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'SUCCESS':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            Forensic Audit Logging System
          </h2>
          <p className="text-xs text-slate-400">
            Immutable activity records for compliance with IATF 16949 Section 7.5.3 (Control of Documented Information).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user, IP, action details, or document resource..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
            />
          </div>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Actions ({logs.length})</option>
            {actions.map((act) => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="SUCCESS">Success</option>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between">
          <span>Showing <strong className="text-slate-200">{filteredLogs.length}</strong> recorded forensic events</span>
          {(searchQuery || selectedAction !== 'ALL' || selectedSeverity !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedAction('ALL');
                setSelectedSeverity('ALL');
              }}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">User & Role</th>
                <th className="py-3 px-3">Action Type</th>
                <th className="py-3 px-3">Event Details & Target</th>
                <th className="py-3 px-3">IP Address</th>
                <th className="py-3 px-4 text-right">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="hover:bg-slate-800/40 transition cursor-pointer"
                >
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-200">{log.username}</div>
                    <div className="text-[10px] text-slate-500 font-sans">{log.userRole}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-amber-300 font-bold">{log.action}</span>
                  </td>

                  <td className="py-3 px-3 font-sans max-w-xs truncate">
                    <div className="text-slate-200 font-medium truncate">{log.details}</div>
                    {log.resourceName && (
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        Target: {log.resourceName}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-3 text-slate-400">
                    {log.ipAddress}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${severityBadge(log.severity)}`}>
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <span>Forensic Event Record Details</span>
              </h3>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Log ID:</span>
                <span className="text-slate-300">{selectedLog.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp (UTC):</span>
                <span className="text-slate-300">{selectedLog.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">User:</span>
                <span className="text-amber-400">{selectedLog.username} ({selectedLog.userRole})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Action:</span>
                <span className="text-emerald-400 font-bold">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Origin IP:</span>
                <span className="text-slate-300">{selectedLog.ipAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Severity:</span>
                <span className="text-slate-200">{selectedLog.severity}</span>
              </div>
              {selectedLog.resourceName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Resource:</span>
                  <span className="text-slate-300 truncate max-w-[240px]">{selectedLog.resourceName}</span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-400 text-[11px] block mb-1">Event Narrative:</span>
              <p className="text-slate-200 leading-relaxed font-sans">{selectedLog.details}</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

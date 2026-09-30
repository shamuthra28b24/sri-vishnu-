import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  UserX,
  FileWarning,
  Flame,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  Activity,
  Bug,
  Sparkles,
  Shield,
  Gauge
} from 'lucide-react';
import { SecurityAlert, User } from '../types';
import { vaultStorage } from '../services/storageService';

interface SecurityCenterViewProps {
  alerts: SecurityAlert[];
  currentUser: User;
  onUpdateAlert: (alertId: string, status: SecurityAlert['status'], actionTaken?: string) => void;
  onTriggerSimulatedAlert: (type: 'failed_logins' | 'unauthorized_download' | 'tamper') => void;
}

export const SecurityCenterView: React.FC<SecurityCenterViewProps> = ({
  alerts,
  currentUser,
  onUpdateAlert,
  onTriggerSimulatedAlert
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [resolutionAction, setResolutionAction] = useState('');

  const riskAssessment = vaultStorage.calculateSecurityRiskScore();

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
    return true;
  });

  const highCount = alerts.filter((a) => a.severity === 'HIGH' || a.severity === 'CRITICAL').length;
  const newCount = alerts.filter((a) => a.status === 'NEW').length;

  const handleResolve = () => {
    if (!selectedAlert) return;
    onUpdateAlert(selectedAlert.id, 'RESOLVED', resolutionAction || 'Mitigated threat and verified system integrity.');
    setSelectedAlert(null);
    setResolutionAction('');
  };

  const handleDismiss = () => {
    if (!selectedAlert) return;
    onUpdateAlert(selectedAlert.id, 'DISMISSED', 'Reviewed by security administrator and dismissed as false positive.');
    setSelectedAlert(null);
    setResolutionAction('');
  };

  const getScoreColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-rose-500 border-rose-500/50 bg-rose-500/10';
      case 'HIGH':
        return 'text-orange-500 border-orange-500/50 bg-orange-500/10';
      case 'MEDIUM':
        return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
      default:
        return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            Security Center & Enterprise Risk Sentinel
          </h2>
          <p className="text-xs text-slate-400">
            Real-time threat monitoring: Failed logins, brute-force anomalies, unauthorized exfiltration, and tamper verification.
          </p>
        </div>

        {/* Live Simulation triggers for College Viva */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onTriggerSimulatedAlert('failed_logins')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
            title="Simulate 5 failed logins from external IP"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Brute Force Probe</span>
          </button>

          <button
            onClick={() => onTriggerSimulatedAlert('unauthorized_download')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-rose-300 border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
            title="Simulate unauthorized role downloading sensitive file"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Exfiltration</span>
          </button>
        </div>
      </div>

      {/* Security Risk Score & Threat Assessment Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl border flex flex-col items-center justify-center font-bold ${getScoreColor(riskAssessment.level)}`}>
              <span className="text-2xl font-black font-['Space_Grotesk']">{riskAssessment.score}</span>
              <span className="text-[9px] uppercase font-mono tracking-tighter">/ 100</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-100">Dynamic Security Risk Index</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getScoreColor(riskAssessment.level)}`}>
                  {riskAssessment.level} RISK
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates failed authentication spikes, quarantined file signatures, tamper status, and expired compliance certificates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-slate-500 block text-[10px]">Active Sessions:</span>
              <span className="font-bold text-emerald-400">4 Secure (TLS 1.3)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-slate-500 block text-[10px]">Cipher Engine:</span>
              <span className="font-mono text-amber-400 font-bold">AES-256-GCM</span>
            </div>
          </div>
        </div>

        {/* Risk Factors breakdown */}
        {riskAssessment.factors.length > 0 && (
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-300">Active Vulnerability Contributors:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {riskAssessment.factors.map((f, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">{f.description}</span>
                  <span className="font-mono font-bold text-rose-400 text-xs shrink-0 ml-2">+{f.impact} Risk</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Security Threat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Unresolved Alerts</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-400">{newCount}</span>
            <span className="text-xs text-slate-400">pending analyst</span>
          </div>
          <p className="text-[11px] text-slate-500">Awaiting security analyst sign-off</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Failed Logins (24h)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">4</span>
            <span className="text-xs text-rose-400">Blocked by edge rule</span>
          </div>
          <p className="text-[11px] text-slate-500">IP rate-limiting active (185.220.101.5)</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Quarantined Uploads</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-rose-400">1</span>
            <span className="text-xs text-slate-400">in isolation sandbox</span>
          </div>
          <p className="text-[11px] text-slate-500">CAD macro container script flagged</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Storage Cryptography</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400">100% Pure</span>
          </div>
          <p className="text-[11px] text-slate-500">Zero plaintext files exposed to web root</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-300 font-semibold">Filter Incident Logs:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Severity & Time</th>
                <th className="py-3 px-3">Alert Incident</th>
                <th className="py-3 px-3">Source & Target</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No security alerts match filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-400 border-red-500/40'
                            : alert.severity === 'HIGH'
                            ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                            : alert.severity === 'MEDIUM'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-100">{alert.title}</div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{alert.description}</p>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px]">
                      <div>Source IP: <span className="text-amber-300">{alert.sourceIp}</span></div>
                      {alert.affectedUser && (
                        <div className="text-slate-400">User: {alert.affectedUser}</div>
                      )}
                      {alert.affectedFile && (
                        <div className="text-slate-500 truncate max-w-[120px]">File: {alert.affectedFile}</div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        alert.status === 'NEW'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : alert.status === 'INVESTIGATING'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : alert.status === 'RESOLVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {alert.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Mitigation Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <span>Security Threat Investigation</span>
              </h3>
              <button onClick={() => setSelectedAlert(null)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Incident Title:</span>
                <span className="font-bold text-slate-200">{selectedAlert.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Severity:</span>
                <span className="font-mono text-red-400 font-bold">{selectedAlert.severity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Source IP:</span>
                <span className="font-mono text-amber-300">{selectedAlert.sourceIp}</span>
              </div>
              <p className="text-slate-300 pt-2 border-t border-slate-900 leading-relaxed">
                {selectedAlert.description}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Remediation / Analyst Action Notes:
              </label>
              <textarea
                value={resolutionAction}
                onChange={(e) => setResolutionAction(e.target.value)}
                placeholder="Document actions taken (e.g. Blocked offending IP at edge firewall, verified user password reset, cleared quarantine)..."
                rows={3}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={handleDismiss}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-400 cursor-pointer"
              >
                Dismiss False Positive
              </button>
              <button
                onClick={handleResolve}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow-md cursor-pointer"
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

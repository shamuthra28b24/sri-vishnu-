import React, { useState } from 'react';
import {
  HardDriveDownload,
  HardDriveUpload,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Flame,
  FileCheck2,
  Calendar,
  Sparkles,
  Download,
  Upload
} from 'lucide-react';
import { VaultBackup, User } from '../types';

interface BackupRecoveryViewProps {
  currentUser: User;
  onExportBackup: () => VaultBackup;
  onRestoreBackup: (backup: VaultBackup) => void;
}

export const BackupRecoveryView: React.FC<BackupRecoveryViewProps> = ({
  currentUser,
  onExportBackup,
  onRestoreBackup
}) => {
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [restoreMessage, setRestoreMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isAdmin = currentUser.role === 'Admin';

  const handleDownloadBackup = () => {
    try {
      setIsProcessing(true);
      const backup = onExportBackup();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `SVHT_Vault_Backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setExportMessage(`Vault snapshot generated successfully! (${backup.totalFiles} encrypted documents, ${backup.totalAuditLogs} audit records). Checksum: ${backup.checksum}`);
    } catch (err: any) {
      setExportMessage('Backup failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawJson = event.target?.result as string;
        const parsed = JSON.parse(rawJson) as VaultBackup;

        if (!parsed.files || !parsed.systemName) {
          throw new Error('Invalid backup archive structure. Missing core cryptographic payload.');
        }

        onRestoreBackup(parsed);
        setRestoreMessage({
          text: `Successfully restored vault snapshot from ${new Date(parsed.exportDate).toLocaleString()}! Restored ${parsed.files.length} documents.`,
          success: true
        });
      } catch (err: any) {
        setRestoreMessage({
          text: 'Restore aborted: ' + (err.message || 'Invalid JSON file'),
          success: false
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <HardDriveDownload className="w-5 h-5 text-amber-400" />
          Encrypted Vault Backup & Disaster Recovery
        </h2>
        <p className="text-xs text-slate-400">
          Point-in-time cryptographic snapshots of encrypted payloads, metallurgical metadata, role tables, and forensic audit histories.
        </p>
      </div>

      {!isAdmin && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
          Backup creation and database restoration are reserved for the <strong>Administrator</strong>.
        </div>
      )}

      {/* Two action cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Backup */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Download className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                AES-256 SIGNED
              </span>
            </div>

            <div>
              <h3 className="font-bold text-lg text-slate-100">Export Encrypted Vault Snapshot</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Bundles all active documents, AES-256-GCM cipher blocks, IV vectors, historical versions, user accounts, and immutable audit trails into a verifiable JSON archive.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
              <div>Scope: Complete Document Metadata + Ciphertext Blobs</div>
              <div>Integrity: Cryptographic Header Signature Verified</div>
              <div>Frequency: Recommended Daily / Pre-Audit</div>
            </div>
          </div>

          <div className="space-y-3 pt-3">
            {exportMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                {exportMessage}
              </div>
            )}

            <button
              onClick={handleDownloadBackup}
              disabled={!isAdmin || isProcessing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <HardDriveDownload className="w-4 h-4" />
              <span>{isProcessing ? 'Packaging Archive...' : 'Generate & Download Backup (.json)'}</span>
            </button>
          </div>
        </div>

        {/* Restore Backup */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Upload className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                POINT-IN-TIME RESTORE
              </span>
            </div>

            <div>
              <h3 className="font-bold text-lg text-slate-100">Restore Vault from Snapshot</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Upload a verified Sri Vishnu Heat Treaters vault package to reconstruct metadata, reinstate document versions, and synchronize audit registers.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
              <div>Verification: Verifies JSON structure before applying</div>
              <div>Audit Trail: Logs RESTORE event with admin user ID</div>
              <div>Safety: Does not overwrite master encryption passphrase</div>
            </div>
          </div>

          <div className="space-y-3 pt-3">
            {restoreMessage && (
              <div className={`p-3 rounded-xl border text-xs ${
                restoreMessage.success ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-red-500/10 text-red-300 border-red-500/30'
              }`}>
                {restoreMessage.text}
              </div>
            )}

            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreFile}
                disabled={!isAdmin}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs text-center transition cursor-pointer flex items-center justify-center gap-2">
                <HardDriveUpload className="w-4 h-4 text-amber-400" />
                <span>Select Snapshot File to Restore (.json)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

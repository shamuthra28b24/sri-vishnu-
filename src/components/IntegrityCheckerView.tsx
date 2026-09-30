import React, { useState } from 'react';
import {
  FileCheck2,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Sparkles,
  Lock,
  Eye,
  FileText
} from 'lucide-react';
import { DocumentFile, User } from '../types';

interface IntegrityCheckerViewProps {
  files: DocumentFile[];
  currentUser: User;
  onVerifyIntegrity: (fileId: string) => Promise<{ isValid: boolean; currentHash: string; expectedHash: string }>;
  onSimulateTamper: (fileId: string) => void;
  onSelectFile: (file: DocumentFile) => void;
}

export const IntegrityCheckerView: React.FC<IntegrityCheckerViewProps> = ({
  files,
  currentUser,
  onVerifyIntegrity,
  onSimulateTamper,
  onSelectFile
}) => {
  const [selectedFileId, setSelectedFileId] = useState<string>(files[0]?.id || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    currentHash: string;
    expectedHash: string;
    checkedAt: string;
  } | null>(null);

  const [isSweepingAll, setIsSweepingAll] = useState(false);
  const [sweepStats, setSweepStats] = useState<{ total: number; valid: number; tampered: number } | null>(null);

  const activeFiles = files.filter((f) => !f.isDeleted);
  const targetFile = activeFiles.find((f) => f.id === selectedFileId) || activeFiles[0];

  const handleVerifyCurrent = async () => {
    if (!targetFile) return;
    try {
      setIsVerifying(true);
      const res = await onVerifyIntegrity(targetFile.id);
      setVerificationResult({
        ...res,
        checkedAt: new Date().toLocaleTimeString()
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSweepAll = async () => {
    setIsSweepingAll(true);
    let validCount = 0;
    let tamperedCount = 0;

    for (const f of activeFiles) {
      const res = await onVerifyIntegrity(f.id);
      if (res.isValid) validCount++;
      else tamperedCount++;
    }

    setSweepStats({
      total: activeFiles.length,
      valid: validCount,
      tampered: tamperedCount
    });
    setIsSweepingAll(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-400" />
            Cryptographic SHA-256 Integrity Verifier
          </h2>
          <p className="text-xs text-slate-400">
            FIPS 180-4 Secure Hash Standard verification for metallurgical certificates, logs, and engineering drawings.
          </p>
        </div>

        <button
          onClick={handleSweepAll}
          disabled={isSweepingAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer shadow-md"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSweepingAll ? 'animate-spin' : ''}`} />
          <span>{isSweepingAll ? 'Sweeping Vault...' : 'Run Vault-wide Integrity Sweep'}</span>
        </button>
      </div>

      {/* Sweep Results Summary Banner */}
      {sweepStats && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${sweepStats.tampered === 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider">
                Vault Integrity Sweep Results
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Total Files Scanned: <strong className="text-white">{sweepStats.total}</strong> • Valid:{' '}
                <strong className="text-emerald-400">{sweepStats.valid}</strong> • Tampered:{' '}
                <strong className={sweepStats.tampered > 0 ? 'text-red-400' : 'text-slate-400'}>
                  {sweepStats.tampered}
                </strong>
              </p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-300">
            {((sweepStats.valid / sweepStats.total) * 100).toFixed(1)}% Pure
          </span>
        </div>
      )}

      {/* Verification Tool Two-Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: File Selector (1 span) */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
            Select Document to Inspect
          </h3>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {activeFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => {
                  setSelectedFileId(file.id);
                  setVerificationResult(null);
                }}
                className={`p-3 rounded-xl border text-xs transition cursor-pointer flex flex-col gap-1 ${
                  (targetFile?.id === file.id)
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold truncate max-w-[170px]">{file.fileName}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                    file.integrityStatus === 'Tampered' ? 'bg-red-600 text-white' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {file.integrityStatus}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>{file.category}</span>
                  <span className="font-mono">{file.currentVersion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Hash Comparator & Tamper Lab (2 spans) */}
        {targetFile && (
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold border border-slate-700">
                    {targetFile.category}
                  </span>
                  <h3 className="font-bold text-lg text-slate-100 mt-2">{targetFile.fileName}</h3>
                  <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-2">
                    <span>Uploaded by {targetFile.uploaderName}</span>
                    <span>•</span>
                    <span>{new Date(targetFile.uploadedAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectFile(targetFile)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                    title="Inspect file"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleVerifyCurrent}
                    disabled={isVerifying}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>{isVerifying ? 'Calculating...' : 'Run SHA-256 Check'}</span>
                  </button>
                </div>
              </div>

              {/* Recorded Ingest Hash Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-semibold text-slate-300">Certified Ingest Signature (Stored Baseline):</span>
                  <span className="font-mono text-[10px] text-emerald-400">Recorded at Upload</span>
                </div>
                <div className="font-mono text-xs text-emerald-300 break-all bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  {targetFile.originalSha256Hash}
                </div>
              </div>

              {/* Live Verification Result Box */}
              {verificationResult ? (
                <div className={`p-4 rounded-xl border space-y-2 text-xs transition animate-in fade-in ${
                  verificationResult.isValid
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-red-950/70 border-red-500/60 text-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-2 text-sm">
                      {verificationResult.isValid ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          INTEGRITY VERIFICATION PASSED (100% MATCH)
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-red-400 animate-pulse" />
                          TAMPERING DETECTED! HASH MISMATCH
                        </>
                      )}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Checked: {verificationResult.checkedAt}</span>
                  </div>

                  <div className="space-y-1 font-mono text-[11px] pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-slate-400">Recalculated SHA-256:</span>
                      <div className={`p-2 rounded mt-0.5 break-all ${verificationResult.isValid ? 'bg-emerald-900/40 text-emerald-300' : 'bg-red-900/60 text-white font-bold'}`}>
                        {verificationResult.currentHash}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs pt-1">
                    {verificationResult.isValid
                      ? 'The file payload strictly matches the encrypted master digest. No bit rot, tampering, or malicious alterations have occurred.'
                      : 'WARNING: The binary content does not match the certified master digest. An unauthorized entity may have manipulated the document payload outside the audit pipeline.'}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/50 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                  Click <strong>Run SHA-256 Check</strong> to compute the live hash via Web Crypto API.
                </div>
              )}

              {/* Capstone Tamper Simulation Lab */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/30 to-amber-950/20 border border-red-500/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Viva Defense Lab: Tamper Detection Simulation
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">College Capstone Test Case</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Demonstrate to the college examiner that unauthorized file modification is caught instantaneously.
                  Clicking below injects an out-of-band payload alteration into the target document.
                </p>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => {
                      onSimulateTamper(targetFile.id);
                      handleVerifyCurrent();
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span>Simulate Tamper on "{targetFile.fileName}"</span>
                  </button>

                  <button
                    onClick={async () => {
                      // Fix tamper by restoring original
                      targetFile.rawContent = targetFile.versions[0]?.rawContent || 'RESTORED';
                      targetFile.integrityStatus = 'Valid';
                      await handleVerifyCurrent();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    Restore Original Signature
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

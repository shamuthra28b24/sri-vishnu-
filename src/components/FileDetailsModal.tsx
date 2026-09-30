import React, { useState } from 'react';
import {
  Lock,
  Download,
  FileCheck2,
  AlertTriangle,
  History,
  ShieldCheck,
  Flame,
  UserCheck,
  Eye,
  Key,
  Calendar,
  CheckCircle2,
  XCircle,
  Copy,
  Check
} from 'lucide-react';
import { DocumentFile, User } from '../types';

interface FileDetailsModalProps {
  file: DocumentFile;
  currentUser: User;
  onClose: () => void;
  onDownload: () => void;
  onVerifyIntegrity: () => void;
  onSimulateTamper: () => void;
}

export const FileDetailsModal: React.FC<FileDetailsModalProps> = ({
  file,
  currentUser,
  onClose,
  onDownload,
  onVerifyIntegrity,
  onSimulateTamper
}) => {
  const [activeTab, setActiveTab] = useState<'crypto' | 'metallurgy' | 'versions' | 'permissions'>('crypto');
  const [copiedHash, setCopiedHash] = useState(false);

  const canDownload = file.permissions.canDownload.includes(currentUser.role);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(file.sha256Hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
              <span className="font-mono font-bold text-xs text-amber-400 uppercase">
                {file.fileExtension}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 break-all">{file.fileName}</h3>
              <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-1">
                <span>{(file.fileSizeBytes / 1024).toFixed(1)} KB</span>
                <span>•</span>
                <span>{file.category}</span>
                <span>•</span>
                <span>Version {file.currentVersion}</span>
                <span>•</span>
                <span className={`px-2 py-0.2 rounded-full font-semibold text-[10px] border ${
                  file.approvalStatus === 'Approved'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : file.approvalStatus === 'Rejected'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {file.approvalStatus}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-semibold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tamper Warning Banner if detected */}
        {file.integrityStatus === 'Tampered' && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-950/90 border border-red-500/60 text-red-200 flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2 text-xs">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>
                <strong>CRITICAL ALERT:</strong> Recalculated SHA-256 hash does not match original ingest checksum! Unauthorized payload modification or bit corruption detected.
              </span>
            </div>
            <button
              onClick={onVerifyIntegrity}
              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg shrink-0 cursor-pointer"
            >
              Re-Verify
            </button>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex items-center gap-2 mt-4 pb-2 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('crypto')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'crypto'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Cryptographic & Security</span>
          </button>

          <button
            onClick={() => setActiveTab('metallurgy')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'metallurgy'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Metallurgical Parameters</span>
          </button>

          <button
            onClick={() => setActiveTab('versions')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'versions'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Version History ({file.versions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'permissions'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Access Control (RBAC)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4 min-h-[260px]">
          {/* 1. CRYPTO TAB */}
          {activeTab === 'crypto' && (
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Encryption Standard:</div>
                  <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                    AES-256-GCM (NIST SP 800-38D)
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Authenticated Encryption with 128-bit integrity tag
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Integrity Verification:</div>
                  <div className="font-mono font-bold text-sm mt-0.5 flex items-center gap-1.5">
                    {file.integrityStatus === 'Valid' ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4" /> INTEGRITY VERIFIED (PASS)
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> INTEGRITY TAMPER DETECTED
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    FIPS 180-4 Secure Hash Standard
                  </div>
                </div>
              </div>

              {/* SHA-256 Hash Display */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-semibold text-slate-300">SHA-256 Cryptographic Digest:</span>
                  <button
                    onClick={handleCopyHash}
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedHash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
                  </button>
                </div>
                <div className="p-2 rounded bg-slate-900 font-mono text-xs text-amber-300 break-all select-all">
                  {file.sha256Hash}
                </div>
              </div>

              {/* IV and Auth Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 font-sans text-[11px]">96-bit Initialization Vector (IV):</div>
                  <div className="text-slate-200 mt-1 break-all bg-slate-900 p-1.5 rounded">{file.iv}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 font-sans text-[11px]">128-bit GCM Auth Tag:</div>
                  <div className="text-slate-200 mt-1 break-all bg-slate-900 p-1.5 rounded">{file.authTag}</div>
                </div>
              </div>

              {/* Ciphertext hex preview */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] block">
                  Encrypted Payload Hex Preview (Disk Storage State - Never Plaintext):
                </span>
                <div className="font-mono text-[11px] text-slate-500 break-all bg-slate-900 p-2 rounded max-h-16 overflow-y-auto">
                  {file.encryptedDataPreview} ... [RESTRICTED CIPHERTEXT]
                </div>
              </div>
            </div>
          )}

          {/* 2. METALLURGY TAB */}
          {activeTab === 'metallurgy' && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Heat Number:</div>
                  <div className="font-mono font-bold text-amber-400 mt-0.5">{file.metadata.heatNumber || 'N/A'}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Batch Number:</div>
                  <div className="font-mono font-bold text-slate-200 mt-0.5">{file.metadata.batchNumber || 'N/A'}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Material Grade:</div>
                  <div className="font-mono font-bold text-slate-200 mt-0.5">{file.metadata.materialGrade || 'N/A'}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Furnace / Cell:</div>
                  <div className="text-slate-200 mt-0.5">{file.metadata.furnaceId || 'N/A'}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Hardness Required:</div>
                  <div className="text-slate-200 mt-0.5 font-semibold">{file.metadata.hardnessRequired || 'N/A'}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Case Depth Spec:</div>
                  <div className="text-slate-200 mt-0.5">{file.metadata.caseDepthRequired || 'N/A'}</div>
                </div>
              </div>

              {file.metadata.customerName && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Customer Organization:</span>
                  <span className="font-semibold text-slate-200">{file.metadata.customerName}</span>
                </div>
              )}

              {file.reviewRemarks && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[11px]">Reviewer Remarks & Digital Sign-off:</div>
                  <p className="text-slate-300 italic">{file.reviewRemarks}</p>
                  <div className="text-[10px] text-slate-500">
                    Reviewed by {file.reviewerName} on {new Date(file.reviewedAt || '').toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. VERSIONS TAB */}
          {activeTab === 'versions' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-400 text-[11px]">
                Preserved historical versions. Each version retains its individual SHA-256 hash and encrypted payload.
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {file.versions.map((ver, idx) => (
                  <div key={ver.versionId} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {ver.versionNumber}
                        </span>
                        <span className="text-slate-200 font-medium">Uploaded by {ver.uploaderName}</span>
                        {idx === file.versions.length - 1 && (
                          <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-1.5 py-0.2 rounded">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(ver.uploadedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{ver.changeLog}</p>
                    <div className="font-mono text-[10px] text-slate-500 truncate" title={ver.sha256Hash}>
                      SHA-256: {ver.sha256Hash}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. PERMISSIONS TAB */}
          {activeTab === 'permissions' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-400 text-[11px]">
                Role-Based Access Control matrix governing this specific document:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-semibold text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Role</th>
                      <th className="py-2 px-3 text-center">View</th>
                      <th className="py-2 px-3 text-center">Download</th>
                      <th className="py-2 px-3 text-center">Edit / Version</th>
                      <th className="py-2 px-3 text-center">Delete</th>
                      <th className="py-2 px-3 text-center">Approve</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {(['Admin', 'Manager', 'Employee', 'Viewer'] as const).map((role) => (
                      <tr key={role} className={currentUser.role === role ? 'bg-amber-500/10' : ''}>
                        <td className="py-2.5 px-3 font-semibold text-slate-200">
                          {role} {currentUser.role === role && '(YOU)'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {file.permissions.canView.includes(role) ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {file.permissions.canDownload.includes(role) ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {file.permissions.canEdit.includes(role) ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {file.permissions.canDelete.includes(role) ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {file.permissions.canApprove.includes(role) ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onVerifyIntegrity}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Verify SHA-256</span>
            </button>

            <button
              onClick={onSimulateTamper}
              className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-xs font-semibold text-red-400 border border-red-500/30 transition cursor-pointer flex items-center gap-1.5"
              title="Demonstrate tamper detection for viva examiners"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate Tamper (Viva)</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
            >
              Close
            </button>

            {canDownload && (
              <button
                onClick={onDownload}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Decrypt & Download</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

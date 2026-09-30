import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  UserCheck,
  Printer,
  FileCheck2,
  ExternalLink,
  Flame,
  QrCode,
  Tag,
  Building,
  Layers
} from 'lucide-react';
import { DocumentFile, User } from '../types';

interface FilePreviewModalProps {
  file: DocumentFile;
  currentUser: User;
  onClose: () => void;
  onDownload: () => void;
  onVerifyIntegrity: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  currentUser,
  onClose,
  onDownload,
  onVerifyIntegrity
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'metadata' | 'encryption'>('preview');

  const canDownload =
    currentUser.role === 'Admin' ||
    file.permissions.canDownload.includes(currentUser.role) ||
    file.uploadedBy === currentUser.id;

  const isExcel = file.fileExtension === 'xlsx' || file.fileExtension === 'csv';
  const isImage = ['png', 'jpg', 'jpeg'].includes(file.fileExtension);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 lg:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-5xl h-[88vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white truncate">
                  {file.fileName}
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                  {file.currentVersion}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                  AES-256 Validated
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {file.category} • {file.department} • {(file.fileSizeBytes / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canDownload && (
              <button
                onClick={onDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download Decrypted</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-slate-950/50 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('preview')}
            className={`pb-2.5 font-semibold transition border-b-2 cursor-pointer ${
              activeTab === 'preview'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Document Preview
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`pb-2.5 font-semibold transition border-b-2 cursor-pointer ${
              activeTab === 'metadata'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Metallurgical Metadata & Audit
          </button>
          <button
            onClick={() => setActiveTab('encryption')}
            className={`pb-2.5 font-semibold transition border-b-2 cursor-pointer ${
              activeTab === 'encryption'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            AES-256 Cryptographic Block
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950">
          {activeTab === 'preview' && (
            <div className="max-w-4xl mx-auto rounded-2xl bg-white text-slate-900 shadow-2xl p-6 sm:p-8 font-sans border border-slate-200">
              {/* Official Sri Vishnu Heat Treaters Letterhead */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 flex items-center justify-center text-white shadow-md">
                    <Flame className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-slate-950">
                      SRI VISHNU HEAT TREATERS
                    </h2>
                    <p className="text-xs text-slate-600 font-medium">
                      Specialists in Gas Carburizing, Sealed Quench (SQF), Induction Hardening & Pyrometry
                    </p>
                    <p className="text-[10px] text-slate-500">
                      SIDCO Industrial Estate, Coimbatore - 641021, Tamil Nadu, India • ISO 9001:2015 & IATF 16949 Certified
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded bg-slate-100 border border-slate-300 text-[10px] font-mono font-bold text-slate-800">
                    CERTIFIED VAULT COPY
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Date: {new Date(file.uploadedAt).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    ID: {file.id.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Document Title Banner */}
              <div className="bg-slate-100 rounded-xl p-3 border border-slate-300 text-center mb-6">
                <h4 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                  {file.fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Category: {file.category} | Classification: {file.securityClassification}
                </p>
              </div>

              {/* Metallurgical Specification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-6">
                <div>
                  <span className="text-slate-500 block text-[10px]">Heat / Melt No:</span>
                  <span className="font-bold text-slate-900 font-mono">{file.metadata.heatNumber || 'HT-2026-904'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Batch Track ID:</span>
                  <span className="font-bold text-slate-900 font-mono">{file.metadata.batchNumber || 'SVHT-SQF-4412'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Furnace Unit:</span>
                  <span className="font-bold text-slate-900">{file.metadata.furnaceId || 'SQF Furnace #1'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Customer Name:</span>
                  <span className="font-bold text-slate-900">{file.metadata.customerName || 'Sundram Fasteners'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Material Grade:</span>
                  <span className="font-bold text-slate-900 font-mono">{file.metadata.materialGrade || '20MnCr5'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Observed Hardness:</span>
                  <span className="font-bold text-slate-900">{file.metadata.hardnessRequired || '60 - 62 HRC'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Effective Case Depth:</span>
                  <span className="font-bold text-slate-900">{file.metadata.caseDepthRequired || '0.80 - 1.10 mm'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Quench Medium:</span>
                  <span className="font-bold text-slate-900">{file.metadata.quenchMedium || 'Accelerated Oil'}</span>
                </div>
              </div>

              {/* Sample Document Body Content */}
              {isExcel ? (
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-xs text-left border border-slate-300">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                      <tr>
                        <th className="p-2 border-r border-slate-300">Timestamp</th>
                        <th className="p-2 border-r border-slate-300">Zone 1 (°C)</th>
                        <th className="p-2 border-r border-slate-300">Zone 2 (°C)</th>
                        <th className="p-2 border-r border-slate-300">Carbon Pot. (%C)</th>
                        <th className="p-2 border-r border-slate-300">Quench Temp (°C)</th>
                        <th className="p-2">CQI-9 Pyrometry Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                      <tr>
                        <td className="p-2 border-r border-slate-200">08:00 AM</td>
                        <td className="p-2 border-r border-slate-200">920°C</td>
                        <td className="p-2 border-r border-slate-200">925°C</td>
                        <td className="p-2 border-r border-slate-200">1.10%</td>
                        <td className="p-2 border-r border-slate-200">65°C</td>
                        <td className="p-2 text-emerald-600 font-bold">In Calibration</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-200">10:30 AM</td>
                        <td className="p-2 border-r border-slate-200">922°C</td>
                        <td className="p-2 border-r border-slate-200">924°C</td>
                        <td className="p-2 border-r border-slate-200">1.12%</td>
                        <td className="p-2 border-r border-slate-200">65°C</td>
                        <td className="p-2 text-emerald-600 font-bold">In Calibration</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-200">01:00 PM</td>
                        <td className="p-2 border-r border-slate-200">840°C</td>
                        <td className="p-2 border-r border-slate-200">842°C</td>
                        <td className="p-2 border-r border-slate-200">0.85%</td>
                        <td className="p-2 border-r border-slate-200">62°C</td>
                        <td className="p-2 text-emerald-600 font-bold">Quench Ready</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="space-y-3 text-xs text-slate-700 leading-relaxed mb-6">
                  <p>
                    <strong>1.0 Scope & Objective:</strong> This document certifies that the heat-treatment process conducted at Sri Vishnu Heat Treaters strictly adhered to customer engineering specification {file.metadata.customerName || 'Standard OEM'} and IATF 16949 / CQI-9 pyrometric guidelines.
                  </p>
                  <p>
                    <strong>2.0 Microstructure Examination:</strong> The component core exhibits uniform tempered martensite with fine carbide dispersion at 500x magnification. No retained austenite or decarburization was detected along the active case-hardened perimeter.
                  </p>
                  <p>
                    <strong>3.0 Hardness Traverse Profile:</strong> Micro-hardness testing conducted using Vickers 1 kg load verified effective case depth meeting specification tolerances across all sample coupons from heat {file.metadata.heatNumber || 'HT-2026'}.
                  </p>
                </div>
              )}

              {/* Digital Authentication Footer & QR */}
              <div className="pt-6 border-t-2 border-slate-900 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg border border-slate-300">
                    <QrCode className="w-12 h-12 text-slate-900" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Cryptographically Certified Vault Ingest</div>
                    <div className="font-mono text-[10px] text-slate-500 break-all max-w-xs">
                      SHA256: {file.sha256Hash}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      ✓ Approval Status: {file.approvalStatus} (Approved by {file.reviewerName || 'QA Head'})
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-900">R. Viswanathan / Karthik S.</div>
                  <div className="text-[10px] text-slate-500">Quality Assurance Authority</div>
                  <div className="text-[10px] text-slate-500">Sri Vishnu Heat Treaters, Coimbatore</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metadata' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="font-bold text-sm text-white">Full File Metadata & Audit Properties</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">System UUID:</span>
                    <span className="font-mono text-amber-400 font-bold">{file.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Current Version:</span>
                    <span className="font-mono text-slate-200">{file.currentVersion} ({file.versions.length} recorded versions)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Uploaded By:</span>
                    <span className="text-slate-200">{file.uploaderName} ({file.uploaderRole})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Uploaded At:</span>
                    <span className="text-slate-200">{new Date(file.uploadedAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Document Expiry Date:</span>
                    <span className="text-slate-200">{file.expiryDate || 'Permanent / No Expiry'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Expiry Status:</span>
                    <span className="text-emerald-400 font-bold">{file.expiryStatus}</span>
                  </div>
                </div>
              </div>

              {file.description && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-xs font-semibold mb-1">Description:</span>
                  <p className="text-xs text-slate-300">{file.description}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'encryption' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>AES-256-GCM Cryptographic Parameters</span>
                </h4>
                <p className="text-slate-400">
                  The raw file content is encrypted prior to disk storage using NIST SP 800-38D AES Galois/Counter Mode.
                </p>

                <div className="space-y-2 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Algorithm:</span>
                    <span className="text-amber-400">AES-256-GCM (256-bit Key, PBKDF2 100,000 iterations)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Initialization Vector (IV - 96 bit):</span>
                    <span className="text-slate-300 break-all">{file.iv}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Authentication Tag (AuthTag - 128 bit):</span>
                    <span className="text-slate-300 break-all">{file.authTag}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Encrypted Ciphertext Preview:</span>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 break-all max-h-32 overflow-y-auto">
                      {file.encryptedDataPreview}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

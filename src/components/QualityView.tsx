import React, { useState } from 'react';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  Search,
  Eye,
  Download,
  AlertTriangle,
  UploadCloud,
  Layers,
  FileText,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { DocumentFile, User } from '../types';

interface QualityViewProps {
  files: DocumentFile[];
  currentUser: User;
  onSelectFile: (file: DocumentFile) => void;
  onDownloadFile: (file: DocumentFile) => void;
  onOpenUpload: () => void;
  onApprove: (fileId: string, remarks: string) => void;
  onReject: (fileId: string, remarks: string) => void;
}

export const QualityView: React.FC<QualityViewProps> = ({
  files,
  currentUser,
  onSelectFile,
  onDownloadFile,
  onOpenUpload,
  onApprove,
  onReject
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Filter for Quality and Inspection related documents
  const qualityCategories = ['Quality Certificates', 'Inspection Reports', 'Calibration Certificates', 'Audit Documents'];
  const qualityDocs = files.filter(
    (f) => !f.isDeleted && qualityCategories.includes(f.category)
  );

  const filteredDocs = qualityDocs.filter((f) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = f.fileName.toLowerCase().includes(q);
      const matchHeat = f.metadata.heatNumber?.toLowerCase().includes(q);
      const matchCustomer = f.metadata.customerName?.toLowerCase().includes(q);
      const matchGrade = f.metadata.materialGrade?.toLowerCase().includes(q);
      if (!matchName && !matchHeat && !matchCustomer && !matchGrade) return false;
    }
    if (filterType !== 'ALL' && f.approvalStatus !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            Quality Document & Inspection Management
          </h2>
          <p className="text-xs text-slate-400">
            Micro-hardness traverses, Case Depth Certifications, Spectrometer Chemistries, and Customer Quality Reports.
          </p>
        </div>

        {currentUser.role !== 'Viewer' && (
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Quality Report</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search test certificate, Heat Number, Material Grade (20MnCr5), Customer..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none"
        >
          <option value="ALL">All Approvals</option>
          <option value="Approved">Approved Certs</option>
          <option value="Pending Review">Pending Manager Review</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 hover:border-slate-700 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="font-mono font-bold text-xs text-amber-400 uppercase">
                    {doc.fileExtension}
                  </span>
                </div>

                <div>
                  <h3
                    onClick={() => onSelectFile(doc)}
                    className="font-bold text-base text-slate-100 hover:text-amber-400 cursor-pointer"
                  >
                    {doc.fileName}
                  </h3>
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-1">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-300">
                      {doc.category}
                    </span>
                    <span>•</span>
                    <span>Uploaded by {doc.uploaderName}</span>
                    <span>•</span>
                    <span className="text-slate-500">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
                  doc.approvalStatus === 'Approved'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : doc.approvalStatus === 'Rejected'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {doc.approvalStatus}
                </span>

                <button
                  onClick={() => onSelectFile(doc)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  title="Inspect"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {doc.permissions.canDownload.includes(currentUser.role) && (
                  <button
                    onClick={() => onDownloadFile(doc)}
                    className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition cursor-pointer"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Metallurgical Specs Strip */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block">Customer Organization:</span>
                <span className="text-slate-200 font-semibold truncate block">{doc.metadata.customerName || 'Standard Production'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Heat / Batch No:</span>
                <span className="font-mono text-amber-300 font-semibold">{doc.metadata.heatNumber || doc.metadata.batchNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Material Grade:</span>
                <span className="font-mono text-slate-200 font-semibold">{doc.metadata.materialGrade || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Required Hardness:</span>
                <span className="text-emerald-400 font-bold">{doc.metadata.hardnessRequired || 'Per Customer Spec'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

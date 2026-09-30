import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  FileCheck2,
  Eye,
  MessageSquare,
  AlertCircle,
  FileText,
  ShieldCheck,
  Check,
  UserCheck
} from 'lucide-react';
import { DocumentFile, User } from '../types';

interface ApprovalsViewProps {
  files: DocumentFile[];
  currentUser: User;
  onApprove: (fileId: string, remarks: string) => void;
  onReject: (fileId: string, remarks: string) => void;
  onSelectFile: (file: DocumentFile) => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  files,
  currentUser,
  onApprove,
  onReject,
  onSelectFile
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [filterTab, setFilterTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const isReviewer = currentUser.role === 'Admin' || currentUser.role === 'Manager';

  const pendingFiles = files.filter((f) => !f.isDeleted && f.approvalStatus === 'Pending Review');
  const approvedFiles = files.filter((f) => !f.isDeleted && f.approvalStatus === 'Approved');
  const rejectedFiles = files.filter((f) => !f.isDeleted && f.approvalStatus === 'Rejected');

  const currentDisplayFiles =
    filterTab === 'pending' ? pendingFiles : filterTab === 'approved' ? approvedFiles : rejectedFiles;

  const handleOpenActionModal = (fileId: string, type: 'approve' | 'reject') => {
    setSelectedDocId(fileId);
    setActionType(type);
    setReviewRemarks(
      type === 'approve'
        ? 'Metallurgical hardness, case depth, and microstructure photographic records verified. Compliant with customer standard.'
        : 'Quench time out of tolerance / hardness traverse does not meet spec. Requires rework or reprocessing.'
    );
  };

  const handleConfirmAction = () => {
    if (!selectedDocId) return;
    if (actionType === 'approve') {
      onApprove(selectedDocId, reviewRemarks);
    } else {
      onReject(selectedDocId, reviewRemarks);
    }
    setSelectedDocId(null);
    setReviewRemarks('');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-400" />
            Document Approval Workflow
          </h2>
          <p className="text-xs text-slate-400">
            Automotive IATF 16949 Review Pipeline: Employee Upload → Manager Review → Digital Sign-off
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setFilterTab('pending')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review ({pendingFiles.length})</span>
          </button>

          <button
            onClick={() => setFilterTab('approved')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'approved'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Approved ({approvedFiles.length})</span>
          </button>

          <button
            onClick={() => setFilterTab('rejected')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'rejected'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected ({rejectedFiles.length})</span>
          </button>
        </div>
      </div>

      {/* Role Reminder */}
      {!isReviewer && (
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2.5">
          <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            You are currently signed in as <strong>{currentUser.fullName} ({currentUser.role})</strong>.
            Document approval and rejection permissions are reserved for <strong>Managers</strong> and <strong>Admins</strong>.
            Switch to a Manager persona in the top right to test approving records.
          </span>
        </div>
      )}

      {/* List of Documents */}
      {currentDisplayFiles.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-300">No documents in {filterTab} queue</h4>
          <p className="text-xs text-slate-500">All submissions in this category have been processed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentDisplayFiles.map((file) => (
            <div
              key={file.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="font-mono font-bold text-xs text-amber-400 uppercase">
                      {file.fileExtension}
                    </span>
                  </div>

                  <div>
                    <h3
                      onClick={() => onSelectFile(file)}
                      className="font-bold text-base text-slate-100 hover:text-amber-400 cursor-pointer"
                    >
                      {file.fileName}
                    </h3>
                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-1">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-300">
                        {file.category}
                      </span>
                      <span>•</span>
                      <span>{file.department}</span>
                      <span>•</span>
                      <span>Uploaded by <strong className="text-slate-300">{file.uploaderName}</strong> ({file.uploaderRole})</span>
                      <span>•</span>
                      <span className="text-slate-500">{new Date(file.uploadedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onSelectFile(file)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Inspect Document Payload"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {isReviewer && file.approvalStatus === 'Pending Review' && (
                    <>
                      <button
                        onClick={() => handleOpenActionModal(file.id, 'reject')}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleOpenActionModal(file.id, 'approve')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Approve Document</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Metallurgical Inspection Preview Box */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Heat / Batch No:</span>
                  <span className="font-mono text-amber-300 font-semibold">
                    {file.metadata.heatNumber || 'N/A'} {file.metadata.batchNumber && `/ ${file.metadata.batchNumber}`}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block">Material Grade:</span>
                  <span className="font-mono text-slate-200 font-semibold">{file.metadata.materialGrade || 'N/A'}</span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block">Furnace Unit:</span>
                  <span className="text-slate-300 truncate block">{file.metadata.furnaceId || 'N/A'}</span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block">Hardness / ECD:</span>
                  <span className="text-slate-300 truncate block">{file.metadata.hardnessRequired || 'N/A'}</span>
                </div>
              </div>

              {/* Review details if already approved or rejected */}
              {file.reviewedBy && (
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs flex items-start gap-2.5">
                  <MessageSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-300">
                      <strong>{file.reviewerName}</strong> signed off on {new Date(file.reviewedAt || '').toLocaleString()}:
                    </div>
                    <p className="text-slate-400 italic mt-0.5">"{file.reviewRemarks}"</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                {actionType === 'approve' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <span>{actionType === 'approve' ? 'Approve & Release Document' : 'Reject Document'}</span>
              </h3>
              <button onClick={() => setSelectedDocId(null)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Metallurgical Sign-off Remarks:
              </label>
              <textarea
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
              <div>Reviewer: <strong className="text-slate-200">{currentUser.fullName} ({currentUser.role})</strong></div>
              <div>Digital Timestamp: <strong className="text-slate-200">{new Date().toLocaleString()}</strong></div>
              <div className="text-[10px] text-slate-500">Action is logged immutably in the forensic audit trail.</div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setSelectedDocId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition shadow-lg cursor-pointer ${
                  actionType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

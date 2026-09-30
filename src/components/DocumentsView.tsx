import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  FileCheck2,
  AlertTriangle,
  Upload,
  Lock,
  Layers,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldAlert,
  Flame,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Share2,
  Tag,
  Calendar,
  Sparkles,
  Shield,
  Folder,
  FolderPlus,
  FolderLock,
  Edit3,
  MoveRight
} from 'lucide-react';
import {
  DocumentFile,
  User,
  DocumentCategory,
  SecurityClassification,
  DocumentExpiryStatus,
  DocumentFolder
} from '../types';
import { vaultStorage } from '../services/storageService';

interface DocumentsViewProps {
  files: DocumentFile[];
  currentUser: User;
  onSelectFile: (file: DocumentFile) => void;
  onDownloadFile: (file: DocumentFile) => void;
  onOpenUpload: () => void;
  onOpenUploadVersion: (file: DocumentFile) => void;
  onDeleteFile: (fileId: string) => void;
  onVerifyIntegrity: (fileId: string) => void;
  onSimulateTamper: (fileId: string) => void;
  onOpenShareModal: (file: DocumentFile) => void;
  onPreviewFile?: (file: DocumentFile) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  files,
  currentUser,
  onSelectFile,
  onDownloadFile,
  onOpenUpload,
  onOpenUploadVersion,
  onDeleteFile,
  onVerifyIntegrity,
  onSimulateTamper,
  onOpenShareModal,
  onPreviewFile
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedFolder, setSelectedFolder] = useState<string>('ALL');
  const [selectedApproval, setSelectedApproval] = useState<string>('ALL');
  const [selectedClassification, setSelectedClassification] = useState<string>('ALL');
  const [selectedExpiry, setSelectedExpiry] = useState<string>('ALL');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals for Folder creation, Rename, Move
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDept, setNewFolderDept] = useState(currentUser.department);
  const [fileToRename, setFileToRename] = useState<DocumentFile | null>(null);
  const [newDocName, setNewDocName] = useState('');
  const [fileToMove, setFileToMove] = useState<DocumentFile | null>(null);
  const [targetFolderId, setTargetFolderId] = useState('');

  const activeFiles = useMemo(() => files.filter((f) => !f.isDeleted), [files]);
  const folders = vaultStorage.getFolders();

  // Extract all unique tags across all documents
  const allTags = useMemo(() => {
    const set = new Set<string>();
    activeFiles.forEach((f) => {
      (f.tags || []).forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [activeFiles]);

  const categories: DocumentCategory[] = [
    'Production Reports',
    'Quality Certificates',
    'Heat-Treatment Records',
    'Furnace Records',
    'Customer Documents',
    'Employee Records',
    'Invoices & Commercials',
    'Purchase & MTR',
    'Maintenance Records',
    'Calibration Certificates',
    'Inspection Reports',
    'Audit Documents',
    'SOPs & Work Instructions',
    'Legal Documents'
  ];

  // Natural Language Search parser helper
  const parsedSearch = useMemo(() => {
    const raw = searchQuery.trim().toLowerCase();
    let batchFilter: string | null = null;
    let categoryFilter: string | null = null;
    let cleanQuery = raw;

    if (raw.includes('batch')) {
      const match = raw.match(/batch\s*[:#-]?\s*([a-z0-9-]+)/i);
      if (match && match[1]) {
        batchFilter = match[1].toLowerCase();
        cleanQuery = cleanQuery.replace(match[0], '').trim();
      }
    }

    return {
      rawQuery: cleanQuery,
      batchFilter,
      categoryFilter
    };
  }, [searchQuery]);

  // Filtering pipeline
  const filteredFiles = useMemo(() => {
    return activeFiles.filter((file) => {
      // Natural language search
      if (parsedSearch.batchFilter) {
        const fileBatch = (file.metadata.batchNumber || '').toLowerCase();
        if (!fileBatch.includes(parsedSearch.batchFilter)) return false;
      }

      if (parsedSearch.rawQuery) {
        const q = parsedSearch.rawQuery;
        const matchesName = file.fileName.toLowerCase().includes(q);
        const matchesCategory = file.category.toLowerCase().includes(q);
        const matchesHeat = (file.metadata.heatNumber || '').toLowerCase().includes(q);
        const matchesCustomer = (file.metadata.customerName || '').toLowerCase().includes(q);
        const matchesFurnace = (file.metadata.furnaceId || '').toLowerCase().includes(q);
        const matchesHash = file.sha256Hash.toLowerCase().includes(q);
        const matchesGrade = (file.metadata.materialGrade || '').toLowerCase().includes(q);
        const matchesTags = (file.tags || []).some((t) => t.toLowerCase().includes(q));

        if (
          !matchesName &&
          !matchesCategory &&
          !matchesHeat &&
          !matchesCustomer &&
          !matchesFurnace &&
          !matchesHash &&
          !matchesGrade &&
          !matchesTags
        ) {
          return false;
        }
      }

      // Folder filter
      if (selectedFolder !== 'ALL') {
        if (file.folderId !== selectedFolder) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'ALL' && file.category !== selectedCategory) {
        return false;
      }

      // Approval filter
      if (selectedApproval !== 'ALL' && file.approvalStatus !== selectedApproval) {
        return false;
      }

      // Security Classification filter
      if (selectedClassification !== 'ALL' && file.securityClassification !== selectedClassification) {
        return false;
      }

      // Expiry filter
      if (selectedExpiry !== 'ALL' && file.expiryStatus !== selectedExpiry) {
        return false;
      }

      // Tag filter
      if (selectedTag !== 'ALL' && !(file.tags || []).includes(selectedTag)) {
        return false;
      }

      return true;
    });
  }, [
    activeFiles,
    parsedSearch,
    selectedCategory,
    selectedFolder,
    selectedApproval,
    selectedClassification,
    selectedExpiry,
    selectedTag
  ]);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    vaultStorage.createFolder(newFolderName.trim(), newFolderDept);
    setNewFolderName('');
    setShowCreateFolderModal(false);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToRename || !newDocName.trim()) return;
    vaultStorage.renameFile(fileToRename.id, newDocName.trim());
    setFileToRename(null);
  };

  const handleMoveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToMove || !targetFolderId) return;
    const targetFolder = folders.find((f) => f.id === targetFolderId);
    vaultStorage.moveFileToFolder(fileToMove.id, targetFolderId, targetFolder?.name || 'Folder');
    setFileToMove(null);
  };

  const getClassificationBadge = (cls?: SecurityClassification) => {
    switch (cls) {
      case 'HIGHLY CONFIDENTIAL':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'CONFIDENTIAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'PUBLIC':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  const getExpiryBadge = (status?: DocumentExpiryStatus, date?: string) => {
    if (!date || status === 'NOT_APPLICABLE') return null;
    if (status === 'EXPIRED') {
      return (
        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
          EXPIRED ({date})
        </span>
      );
    }
    if (status === 'EXPIRING_SOON') {
      return (
        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
          EXPIRING SOON ({date})
        </span>
      );
    }
    return (
      <span className="text-[9px] text-slate-400 font-mono">
        Exp: {date}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            Secure Document Vault
          </h2>
          <p className="text-xs text-slate-400">
            Encrypted repository for metallurgical cycle logs, quality test certificates, and customer engineering records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {currentUser.role !== 'Viewer' && (
            <button
              onClick={() => setShowCreateFolderModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 text-amber-400" />
              <span>+ New Folder</span>
            </button>
          )}

          {currentUser.role !== 'Viewer' && (
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload & Encrypt File</span>
            </button>
          )}

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* Folders Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-amber-400" />
            Vault Folders:
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {folders.length} Custom Folders Active
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedFolder('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition cursor-pointer border ${
              selectedFolder === 'ALL'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            All Folders ({activeFiles.length})
          </button>
          {folders.map((fld) => {
            const fileCount = activeFiles.filter((f) => f.folderId === fld.id).length;
            const isSel = selectedFolder === fld.id;
            return (
              <button
                key={fld.id}
                onClick={() => setSelectedFolder(isSel ? 'ALL' : fld.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium transition cursor-pointer border ${
                  isSel
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                }`}
              >
                <Folder className="w-3 h-3 text-amber-400" />
                <span>{fld.name}</span>
                <span className="text-[10px] font-mono opacity-60">({fileCount})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Intelligent Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        {/* Natural Language Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Intelligent Search: e.g. 'Show quality reports for Batch 4412', '20MnCr5', 'SQF-1', 'Expired calibration', or SHA-256..."
            className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Multi-Filter Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Categories ({activeFiles.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Classification */}
          <select
            value={selectedClassification}
            onChange={(e) => setSelectedClassification(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Classifications</option>
            <option value="INTERNAL">Internal</option>
            <option value="CONFIDENTIAL">Confidential</option>
            <option value="HIGHLY CONFIDENTIAL">Highly Confidential</option>
            <option value="PUBLIC">Public</option>
          </select>

          {/* Approval Status */}
          <select
            value={selectedApproval}
            onChange={(e) => setSelectedApproval(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Approval Statuses</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Draft">Draft</option>
          </select>

          {/* Expiry Status */}
          <select
            value={selectedExpiry}
            onChange={(e) => setSelectedExpiry(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Expiry States</option>
            <option value="VALID">Valid / Current</option>
            <option value="EXPIRING_SOON">Expiring Soon (30d)</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>

        {/* Tag Filters Row */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
              <Tag className="w-3 h-3 text-amber-400" />
              Tags:
            </span>
            <button
              onClick={() => setSelectedTag('ALL')}
              className={`text-[10px] px-2 py-0.5 rounded-full border transition cursor-pointer ${
                selectedTag === 'ALL'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              All Tags
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? 'ALL' : tag)}
                className={`text-[10px] px-2 py-0.5 rounded-full border transition cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Showing <strong className="text-slate-200">{filteredFiles.length}</strong> of{' '}
          <strong className="text-slate-200">{activeFiles.length}</strong> encrypted documents
        </div>
      </div>

      {/* DOCUMENT LIST (TABLE OR GRID) */}
      {filteredFiles.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <FolderLock className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No documents match the current criteria</h3>
          <p className="text-xs text-slate-500">Try adjusting your natural language search terms or filter selection.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-medium uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Document Details</th>
                  <th className="py-3 px-3">Classification & Dept</th>
                  <th className="py-3 px-3">Batch & Specs</th>
                  <th className="py-3 px-3">Tags & Expiry</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredFiles.map((file) => {
                  const canDownload =
                    currentUser.role === 'Admin' ||
                    file.permissions.canDownload.includes(currentUser.role) ||
                    file.uploadedBy === currentUser.id;
                  const canEdit =
                    currentUser.role === 'Admin' ||
                    file.permissions.canEdit.includes(currentUser.role) ||
                    file.uploadedBy === currentUser.id;
                  const canDelete =
                    currentUser.role === 'Admin' ||
                    file.permissions.canDelete.includes(currentUser.role);
                  const canShare =
                    currentUser.role === 'Admin' ||
                    file.permissions.canShare.includes(currentUser.role);

                  return (
                    <tr key={file.id} className="hover:bg-slate-800/40 transition">
                      {/* Document Details */}
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="font-mono font-bold text-[10px] text-amber-400 uppercase">
                              {file.fileExtension}
                            </span>
                          </div>
                          <div>
                            <div
                              onClick={() => {
                                if (onPreviewFile) {
                                  onPreviewFile(file);
                                } else {
                                  onSelectFile(file);
                                }
                              }}
                              className="font-semibold text-slate-100 hover:text-amber-400 cursor-pointer line-clamp-1"
                              title={file.fileName}
                            >
                              {file.fileName}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{(file.fileSizeBytes / 1024).toFixed(1)} KB</span>
                              <span>•</span>
                              <span>Ver: {file.currentVersion}</span>
                              {file.folderName && (
                                <>
                                  <span>•</span>
                                  <span className="text-amber-400/90 font-mono">📁 {file.folderName}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Classification & Category */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${getClassificationBadge(file.securityClassification)}`}>
                            {file.securityClassification || 'INTERNAL'}
                          </span>
                          <span className="text-[11px] text-slate-300 truncate max-w-[130px]">{file.category}</span>
                        </div>
                      </td>

                      {/* Metallurgical Specs & Batch Link */}
                      <td className="py-3 px-3 font-mono text-[11px]">
                        {file.metadata.batchNumber && (
                          <span className="text-amber-400 font-bold bg-amber-500/10 px-1 rounded">
                            {file.metadata.batchNumber}
                          </span>
                        )}
                        {file.metadata.heatNumber && (
                          <div className="text-slate-300 text-[10px] mt-0.5">Heat: {file.metadata.heatNumber}</div>
                        )}
                        {file.metadata.materialGrade && (
                          <div className="text-slate-400 text-[10px]">Grade: {file.metadata.materialGrade}</div>
                        )}
                      </td>

                      {/* Tags & Expiry */}
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          {getExpiryBadge(file.expiryStatus, file.expiryDate)}
                          <div className="flex flex-wrap gap-1">
                            {(file.tags || []).slice(0, 2).map((tag) => (
                              <span key={tag} className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                            file.approvalStatus === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : file.approvalStatus === 'Rejected'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {file.approvalStatus}
                          </span>

                          {file.integrityStatus === 'Tampered' ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-red-600 text-white animate-pulse">
                              TAMPERED!
                            </span>
                          ) : (
                            <span className="text-[9px] text-emerald-400 flex items-center gap-1">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              AES-256 Valid
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action buttons (Section 3 & 4 requirements) */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview Document */}
                          {onPreviewFile && (
                            <button
                              onClick={() => onPreviewFile(file)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition cursor-pointer"
                              title="Preview Document (Official Letterhead & Specs)"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Inspect Modal */}
                          <button
                            onClick={() => onSelectFile(file)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Inspect Metadata & Cryptographic Block"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Rename File */}
                          {canEdit && (
                            <button
                              onClick={() => {
                                setFileToRename(file);
                                setNewDocName(file.fileName);
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                              title="Rename File"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Move to Folder */}
                          {canEdit && (
                            <button
                              onClick={() => {
                                setFileToMove(file);
                                setTargetFolderId(file.folderId || (folders[0]?.id ?? ''));
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                              title="Move to Folder"
                            >
                              <Folder className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Share file with temporary access */}
                          {canShare && (
                            <button
                              onClick={() => onOpenShareModal(file)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition cursor-pointer"
                              title="Controlled Sharing & Temporary Access Link"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Verify SHA-256 */}
                          <button
                            onClick={() => onVerifyIntegrity(file.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition cursor-pointer"
                            title="Verify SHA-256 Checksum"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Download with Decryption */}
                          {canDownload && (
                            <button
                              onClick={() => onDownloadFile(file)}
                              className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition cursor-pointer"
                              title="Decrypt & Download"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Upload New Version */}
                          {canEdit && (
                            <button
                              onClick={() => onOpenUploadVersion(file)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                              title="Upload New Version"
                            >
                              <Upload className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Simulate Tamper (Viva Demo Feature) */}
                          <button
                            onClick={() => onSimulateTamper(file.id)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 transition cursor-pointer"
                            title="Simulate Unauthorized Tampering (Demo)"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>

                          {/* Soft Delete */}
                          {canDelete && (
                            <button
                              onClick={() => onDeleteFile(file.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 transition cursor-pointer"
                              title="Move to Recycle Bin"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => {
            const canDownload =
              currentUser.role === 'Admin' ||
              file.permissions.canDownload.includes(currentUser.role) ||
              file.uploadedBy === currentUser.id;
            const canEdit =
              currentUser.role === 'Admin' ||
              file.permissions.canEdit.includes(currentUser.role) ||
              file.uploadedBy === currentUser.id;
            const canShare =
              currentUser.role === 'Admin' ||
              file.permissions.canShare.includes(currentUser.role);

            return (
              <div
                key={file.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${getClassificationBadge(file.securityClassification)}`}>
                      {file.securityClassification || 'INTERNAL'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      .{file.fileExtension}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h4
                      onClick={() => {
                        if (onPreviewFile) {
                          onPreviewFile(file);
                        } else {
                          onSelectFile(file);
                        }
                      }}
                      className="font-bold text-sm text-slate-100 hover:text-amber-400 cursor-pointer line-clamp-1"
                    >
                      {file.fileName}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{file.category}</p>
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs">
                    {file.metadata.batchNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Batch ID:</span>
                        <span className="font-mono text-amber-400 font-bold">{file.metadata.batchNumber}</span>
                      </div>
                    )}
                    {file.metadata.materialGrade && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Grade:</span>
                        <span className="font-mono text-slate-200">{file.metadata.materialGrade}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cipher:</span>
                      <span className="font-mono text-[10px] text-emerald-400">AES-256-GCM</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(file.tags || []).map((t) => (
                      <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Ver: {file.currentVersion}</span>

                  <div className="flex items-center gap-1.5">
                    {onPreviewFile && (
                      <button
                        onClick={() => onPreviewFile(file)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition cursor-pointer"
                        title="Preview"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onSelectFile(file)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                      title="Inspect"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {canShare && (
                      <button
                        onClick={() => onOpenShareModal(file)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition cursor-pointer"
                        title="Share"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canDownload && (
                      <button
                        onClick={() => onDownloadFile(file)}
                        className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition cursor-pointer"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE FOLDER MODAL */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="font-bold text-base text-white flex items-center gap-2 mb-4">
              <FolderPlus className="w-5 h-5 text-amber-400" />
              <span>Create New Document Folder</span>
            </h3>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Folder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pyrometry Audits 2026 or Sundram POs"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                <input
                  type="text"
                  value={newFolderDept}
                  onChange={(e) => setNewFolderDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateFolderModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENAME FILE MODAL */}
      {fileToRename && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="font-bold text-base text-white flex items-center gap-2 mb-4">
              <Edit3 className="w-5 h-5 text-amber-400" />
              <span>Rename Document</span>
            </h3>

            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Document Name</label>
                <input
                  type="text"
                  required
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-500 outline-none font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFileToRename(null)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOVE TO FOLDER MODAL */}
      {fileToMove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="font-bold text-base text-white flex items-center gap-2 mb-4">
              <Folder className="w-5 h-5 text-amber-400" />
              <span>Move Document to Folder</span>
            </h3>

            <form onSubmit={handleMoveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">File:</label>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono truncate">
                  {fileToMove.fileName}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Folder:</label>
                <select
                  value={targetFolderId}
                  onChange={(e) => setTargetFolderId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-500 outline-none"
                >
                  {folders.map((fld) => (
                    <option key={fld.id} value={fld.id}>
                      📁 {fld.name} ({fld.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFileToMove(null)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Move Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

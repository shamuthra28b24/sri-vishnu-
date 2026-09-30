import React, { useState } from 'react';
import {
  Folder,
  Tag,
  Clock,
  History,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  RefreshCw,
  FolderPlus
} from 'lucide-react';
import { DocumentFile, User } from '../types';

interface DocControlViewProps {
  files: DocumentFile[];
  currentUser: User;
  onSelectFile: (file: DocumentFile) => void;
  onDownloadFile: (file: DocumentFile) => void;
  onOpenUploadVersion?: (file: DocumentFile) => void;
}

export const DocControlView: React.FC<DocControlViewProps> = ({
  files,
  currentUser,
  onSelectFile,
  onDownloadFile,
  onOpenUploadVersion
}) => {
  const [activeTab, setActiveTab] = useState<'versions' | 'expiry' | 'tags' | 'folders'>('versions');

  const activeFiles = files.filter((f) => !f.isDeleted);
  const versionedFiles = activeFiles.filter((f) => f.versions && f.versions.length > 1);
  const expiringFiles = activeFiles.filter((f) => f.expiryDate);

  const folderHierarchy = [
    { name: 'Production', count: activeFiles.filter((f) => f.category.includes('Production') || f.category.includes('Heat')).length, color: 'text-amber-400' },
    { name: 'Furnace', count: activeFiles.filter((f) => f.category.includes('Furnace')).length, color: 'text-orange-400' },
    { name: 'Quality', count: activeFiles.filter((f) => f.category.includes('Quality') || f.category.includes('Inspection')).length, color: 'text-emerald-400' },
    { name: 'Customer', count: activeFiles.filter((f) => f.category.includes('Customer')).length, color: 'text-blue-400' },
    { name: 'Maintenance', count: activeFiles.filter((f) => f.category.includes('Maintenance') || f.category.includes('Calibration')).length, color: 'text-teal-400' },
    { name: 'Employee', count: activeFiles.filter((f) => f.category.includes('Employee')).length, color: 'text-purple-400' },
    { name: 'Administration', count: activeFiles.filter((f) => f.category.includes('Audit') || f.category.includes('Legal')).length, color: 'text-slate-400' }
  ];

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans']">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
              ISO 9001:2015 Clause 7.5
            </span>
            <span className="text-xs text-slate-400 font-mono">Documented Information & Archival</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-purple-400" />
            <span>Document Control Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Centralized document governance: version control histories, expiration surveillance, corporate tag taxonomies, and folder hierarchies.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
        <button
          onClick={() => setActiveTab('versions')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'versions' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Versions & Revisions</span>
        </button>
        <button
          onClick={() => setActiveTab('expiry')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'expiry' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Document Expiry</span>
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'tags' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Tags & Labels</span>
        </button>
        <button
          onClick={() => setActiveTab('folders')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'folders' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Folder className="w-4 h-4" />
          <span>Company Folder Hierarchy</span>
        </button>
      </div>

      {/* TAB 1: VERSIONS */}
      {activeTab === 'versions' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-200">Revision History Across Vault</h3>
          <div className="space-y-4">
            {versionedFiles.map((file) => (
              <div key={file.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span>{file.fileName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                      Current: {file.currentVersion}
                    </span>
                  </div>
                  {currentUser.role !== 'Viewer' && onOpenUploadVersion && (
                    <button
                      onClick={() => onOpenUploadVersion(file)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-semibold cursor-pointer"
                    >
                      + Release Version
                    </button>
                  )}
                </div>

                <div className="space-y-2 pl-4 border-l-2 border-purple-500/30">
                  {file.versions.map((ver, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 text-slate-300">
                      <div>
                        <span className="font-bold text-purple-400 font-mono mr-2">{ver.versionNumber}</span>
                        <span className="text-slate-400">• {new Date(ver.uploadedAt).toLocaleDateString()}</span>
                        <span className="text-slate-500 ml-2 font-mono">by {ver.uploaderName}</span>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-sans italic">{ver.changeLog || 'Version released with cryptographic signature.'}</p>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Hash: {ver.sha256Hash.slice(0, 10)}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: EXPIRY */}
      {activeTab === 'expiry' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Document</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {expiringFiles.map((file) => (
                <tr key={file.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-semibold text-slate-100">{file.fileName}</td>
                  <td className="py-3 px-4 font-sans text-slate-300">{file.category}</td>
                  <td className="py-3 px-4 font-sans text-amber-400">{new Date(file.expiryDate!).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                      {file.expiryStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectFile(file)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: TAGS */}
      {activeTab === 'tags' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-slate-200">Company Document Tags Taxonomy</h3>
          <div className="flex flex-wrap gap-2.5">
            {['Confidential', 'Quality', 'Production', 'Urgent', 'Customer', 'Calibration', 'Maintenance', 'CQI-9', 'IATF-16949', 'ISO-9001', 'SQF-HeatCycle'].map((tag) => (
              <div key={tag} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300">
                <Tag className="w-3.5 h-3.5 text-purple-400" />
                <span>{tag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: FOLDERS */}
      {activeTab === 'folders' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-slate-200">Company Documents Hierarchy</h3>
            <span className="text-xs text-slate-400 font-mono">Sri Vishnu Heat Treaters Root</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {folderHierarchy.map((fld) => (
              <div key={fld.name} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Folder className={`w-5 h-5 ${fld.color}`} />
                  <div>
                    <span className="font-bold text-xs text-white block">{fld.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{fld.count} documents</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

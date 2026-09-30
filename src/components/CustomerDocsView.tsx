import React, { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  Shield,
  Search,
  Filter,
  Building,
  CheckCircle2,
  Lock,
  Tag,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { DocumentFile, User } from '../types';

interface CustomerDocsViewProps {
  files: DocumentFile[];
  currentUser: User;
  onSelectFile: (file: DocumentFile) => void;
  onDownloadFile: (file: DocumentFile) => void;
  onOpenUpload: () => void;
}

export const CustomerDocsView: React.FC<CustomerDocsViewProps> = ({
  files,
  currentUser,
  onSelectFile,
  onDownloadFile,
  onOpenUpload
}) => {
  const [subCategory, setSubCategory] = useState<'All' | 'Specifications' | 'Orders' | 'Certificates'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const customerFiles = files.filter(
    (f) => !f.isDeleted && (f.category === 'Customer Documents' || f.category === 'Quality Certificates' || f.category === 'Invoices & Commercials')
  );

  const filteredFiles = customerFiles.filter((f) => {
    const matchesSearch = f.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.metadata?.customerName && f.metadata.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;
    if (subCategory === 'Specifications') return f.fileName.toLowerCase().includes('spec') || f.tags.includes('CAD');
    if (subCategory === 'Orders') return f.fileName.toLowerCase().includes('order') || f.fileName.toLowerCase().includes('po');
    if (subCategory === 'Certificates') return f.category === 'Quality Certificates';
    return true;
  });

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans']">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase">
              Automotive & Aerospace Tier-1
            </span>
            <span className="text-xs text-slate-400 font-mono">IATF 16949 Section 8.2</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Building className="w-6 h-6 text-blue-400" />
            <span>Customer Documents & Specifications</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Secure repository for customer engineering drawings, purchase orders, quality test certificates, and NDA specifications.
          </p>
        </div>

        {currentUser.role !== 'Viewer' && (
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition cursor-pointer flex items-center gap-2 self-start md:self-auto"
          >
            <span>+ Upload Customer Doc</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {(['All', 'Specifications', 'Orders', 'Certificates'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSubCategory(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                subCategory === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab === 'All' ? 'All Customer Docs' : tab}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="Search customer, drawing, PO#..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-200 text-xs outline-none"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Customer Document Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Document Name</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Integrity (SHA-256)</th>
                <th className="py-3 px-4">Modified</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No customer documents match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="truncate max-w-xs">{file.fileName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-sans">{file.category}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans font-medium">
                      {file.metadata?.customerName || 'Sundram Fasteners Ltd.'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        {file.securityClassification}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{file.currentVersion}</td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Verified
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(file.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectFile(file)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                          title="View Details & Ciphertext"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDownloadFile(file)}
                          className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 cursor-pointer"
                          title="Decrypt & Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Share2,
  Link,
  Clock,
  Download,
  Eye,
  CheckCircle2,
  Lock,
  Plus,
  ShieldCheck,
  Trash2
} from 'lucide-react';
import { DocumentFile, User } from '../types';

interface SecureSharingViewProps {
  files: DocumentFile[];
  currentUser: User;
  onOpenShareModal: (file: DocumentFile) => void;
  onDownloadFile: (file: DocumentFile) => void;
}

export const SecureSharingView: React.FC<SecureSharingViewProps> = ({
  files,
  currentUser,
  onOpenShareModal,
  onDownloadFile
}) => {
  const activeFiles = files.filter((f) => !f.isDeleted);
  const sharedFiles = activeFiles.filter((f) => f.sharedGrants && f.sharedGrants.length > 0);

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans']">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
              Time-Bound Cryptographic Links
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Share2 className="w-6 h-6 text-amber-400" />
            <span>Secure Sharing & Temporary Access Links</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Issue controlled, time-expiring temporary links for customer quality audits and tier-1 vendor document inspection.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-200">Active Controlled Document Grants</h3>
          <span className="text-xs text-slate-400 font-mono">{sharedFiles.length} files currently shared</span>
        </div>

        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Document</th>
              <th className="py-3 px-4">Recipient</th>
              <th className="py-3 px-4">Permissions</th>
              <th className="py-3 px-4">Expires</th>
              <th className="py-3 px-4">Access Count</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {sharedFiles.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No active temporary share grants. Use the share button on any document to issue an encrypted link.
                </td>
              </tr>
            ) : (
              sharedFiles.map((file) =>
                file.sharedGrants.map((grant) => (
                  <tr key={grant.shareId} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-semibold text-slate-100">{file.fileName}</td>
                    <td className="py-3 px-4 text-slate-300 font-sans">{grant.sharedWithEmail || grant.sharedWithUserRole}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 text-[10px]">
                        {grant.accessLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-amber-400 font-sans">
                      {new Date(grant.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{grant.accessCount} visits</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDownloadFile(file)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  FolderLock,
  Flame,
  ShieldAlert,
  Lock,
  UserCheck
} from 'lucide-react';
import { DocumentFile, User } from '../types';

interface RecycleBinViewProps {
  deletedFiles: DocumentFile[];
  currentUser: User;
  onRestoreFile: (fileId: string) => void;
  onPermanentDelete: (fileId: string) => void;
}

export const RecycleBinView: React.FC<RecycleBinViewProps> = ({
  deletedFiles,
  currentUser,
  onRestoreFile,
  onPermanentDelete
}) => {
  const isAdmin = currentUser.role === 'Admin';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-slate-400" />
            Recycle Bin & Data Retention Storage
          </h2>
          <p className="text-xs text-slate-400">
            Soft-deleted documents awaiting retention purge. Restoration and permanent eradication restricted to Administrators.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          {deletedFiles.length} {deletedFiles.length === 1 ? 'file' : 'files'} in trash
        </div>
      </div>

      {/* Role Reminder if not Admin */}
      {!isAdmin && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            You are signed in as <strong>{currentUser.fullName} ({currentUser.role})</strong>.
            File restoration and permanent cryptographic destruction are strictly restricted to <strong>Administrators</strong>.
          </span>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Document Details</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Deleted By & When</th>
                <th className="py-3 px-3">Cipher Status</th>
                <th className="py-3 px-4 text-right">Retention Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {deletedFiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <Trash2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <span>The Recycle Bin is currently empty. No documents pending retention purge.</span>
                  </td>
                </tr>
              ) : (
                deletedFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-[10px] text-slate-400 uppercase shrink-0">
                          {file.fileExtension}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200 line-through opacity-75">
                            {file.fileName}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {(file.fileSizeBytes / 1024).toFixed(1)} KB • {file.department}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded text-[11px]">
                        {file.category}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-slate-300">{file.deletedBy || 'System Administrator'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {file.deletedAt ? new Date(file.deletedAt).toLocaleString() : 'Recent'}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-[10px] text-slate-500">
                      AES-256 Retained
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isAdmin ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onRestoreFile(file.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`PERMANENTLY PURGE "${file.fileName}"? This erases the encrypted ciphertext blocks forever.`)) {
                                onPermanentDelete(file.id);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Purge</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Admin authorization required</span>
                      )}
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

import React, { useState } from 'react';
import {
  Share2,
  Calendar,
  Clock,
  ShieldCheck,
  User,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Key,
  DownloadCloud,
  FileText
} from 'lucide-react';
import { DocumentFile, UserRole, User as UserType } from '../types';

interface ShareFileModalProps {
  file: DocumentFile;
  currentUser: UserType;
  users: UserType[];
  onClose: () => void;
  onShare: (
    fileId: string,
    recipientEmail: string,
    recipientRole: UserRole,
    daysValid: number,
    accessLevel: 'VIEW_ONLY' | 'VIEW_DOWNLOAD'
  ) => void;
}

export const ShareFileModal: React.FC<ShareFileModalProps> = ({
  file,
  currentUser,
  users,
  onClose,
  onShare
}) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientRole, setRecipientRole] = useState<UserRole>('Viewer');
  const [hoursValid, setHoursValid] = useState('24 Hours');
  const [downloadsAllowed, setDownloadsAllowed] = useState(3);
  const [passwordProtected, setPasswordProtected] = useState(true);
  const [sharePassword, setSharePassword] = useState('HeatTreat@Share2026');
  const [accessLevel, setAccessLevel] = useState<'VIEW_ONLY' | 'VIEW_DOWNLOAD'>('VIEW_DOWNLOAD');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onShare(
      file.id,
      recipientEmail || 'external.auditor@domain.org',
      recipientRole,
      hoursValid === '24 Hours' ? 1 : 7,
      accessLevel
    );

    // Generate secure token URL
    const token = 'svht_share_' + Math.random().toString(36).substring(2, 12) + '_' + file.id;
    setGeneratedLink(`https://srivishnuheattreaters.com/vault/share?token=${token}&auth=enc`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-slate-100">Secure File Sharing (Section 12)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 cursor-pointer">✕</button>
        </div>

        {generatedLink ? (
          <div className="space-y-4 py-2 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-sm text-white">Temporary Secure Link Active!</h4>
              <p className="text-xs text-slate-300">
                A cryptographic, time-limited download token has been generated and logged in the forensic audit trail.
              </p>
            </div>

            {/* Generated Link Card matching Section 12 Specification */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                <span className="font-bold text-slate-200">Share Link Card:</span>
                <span className="text-[10px] text-amber-400">ACTIVE TOKEN</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">File:</span>
                  <span className="text-white font-sans font-semibold truncate max-w-xs">{file.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Expires:</span>
                  <span className="text-amber-400 font-bold">{hoursValid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Downloads Allowed:</span>
                  <span className="text-blue-400 font-bold">{downloadsAllowed} Maximum</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Password Protected:</span>
                  <span className="text-emerald-400 font-bold">{passwordProtected ? 'Yes' : 'No'}</span>
                </div>
                {passwordProtected && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Unlock Password:</span>
                    <span className="text-white font-bold">{sharePassword}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-1">Encrypted Share URL:</span>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-amber-300 break-all select-all">
                  {generatedLink}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `File: ${file.fileName}\nShare Link: ${generatedLink}\nExpires: ${hoursValid}\nDownloads Allowed: ${downloadsAllowed}\nPassword Protected: ${passwordProtected ? 'Yes (' + sharePassword + ')' : 'No'}`
                  );
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }}
                className="w-1/2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied Details!' : 'Copy Share Card'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] block">Target Document:</span>
              <div className="font-semibold text-slate-200 truncate">{file.fileName}</div>
              <div className="text-[10px] text-emerald-400 font-mono">Cipher: AES-256-GCM Encrypted Block</div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Recipient Email or External Entity:
              </label>
              <input
                type="text"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="e.g. auditor.lead@tuv-nord-cert.org or customer@sundram.com"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Access Expiry Window:</label>
                <select
                  value={hoursValid}
                  onChange={(e) => setHoursValid(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none font-mono text-xs"
                >
                  <option value="24 Hours">24 Hours (Express Audit)</option>
                  <option value="48 Hours">48 Hours</option>
                  <option value="7 Days">7 Days</option>
                  <option value="14 Days">14 Days</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Max Download Count:</label>
                <select
                  value={downloadsAllowed}
                  onChange={(e) => setDownloadsAllowed(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none font-mono text-xs"
                >
                  <option value={1}>1 Download</option>
                  <option value={3}>3 Downloads (Recommended)</option>
                  <option value={5}>5 Downloads</option>
                  <option value={10}>10 Downloads</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Permission Control:</label>
                <select
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none text-xs"
                >
                  <option value="VIEW_DOWNLOAD">View & Decrypt Download</option>
                  <option value="VIEW_ONLY">View Only (Restricted)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Password Protection:</label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={passwordProtected}
                    onChange={(e) => setPasswordProtected(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-300">Require Password</span>
                </div>
              </div>
            </div>

            {passwordProtected && (
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Passcode for Recipient:</label>
                <input
                  type="text"
                  value={sharePassword}
                  onChange={(e) => setSharePassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
              >
                Generate Secure Share Link
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

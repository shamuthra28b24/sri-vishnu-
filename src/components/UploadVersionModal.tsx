import React, { useState } from 'react';
import { Layers, Upload, Lock, FileText, AlertCircle, Sparkles } from 'lucide-react';
import { DocumentFile, User } from '../types';

interface UploadVersionModalProps {
  file: DocumentFile;
  currentUser: User;
  onClose: () => void;
  onUploadVersion: (
    fileId: string,
    file: { name: string; size: number; content: string },
    changeLog: string
  ) => Promise<void>;
}

export const UploadVersionModal: React.FC<UploadVersionModalProps> = ({
  file,
  currentUser,
  onClose,
  onUploadVersion
}) => {
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; content: string } | null>(null);
  const [changeLog, setChangeLog] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentVerNumber = parseFloat(file.currentVersion.replace('v', '')) || 1.0;
  const nextVerNumber = `v${(currentVerNumber + 0.1).toFixed(1)}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedFile({
        name: f.name,
        size: f.size,
        content: (event.target?.result as string) || ''
      });
      setErrorMessage(null);
    };
    reader.readAsText(f);
  };

  const loadRevisedSample = () => {
    setSelectedFile({
      name: file.fileName,
      size: file.fileSizeBytes + 1024,
      content: `${file.rawContent || 'METALLURGICAL RECORD'}\n\n[REVISED VERSION ${nextVerNumber} UPDATED ON ${new Date().toLocaleDateString()}]\nUpdated hardness traverse values and pyrometry verification after reheat temper treatment.`
    });
    setChangeLog(`Revised case depth curve and hardness tolerances per customer engineering change notice ECN-${Math.floor(Math.random() * 9000 + 1000)}.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a file revision.');
      return;
    }
    if (!changeLog.trim()) {
      setErrorMessage('Please provide a changelog summary for this new revision.');
      return;
    }

    try {
      setIsProcessing(true);
      await onUploadVersion(file.id, selectedFile, changeLog);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Version upload failed');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base text-slate-100">Upload New Revision</h3>
              <p className="text-xs text-slate-400">
                Preserves historical versions and generates new AES-256 cipher
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">✕</button>
        </div>

        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Target Document:</span>
              <span className="font-semibold text-slate-200 truncate max-w-[240px]">{file.fileName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Current Version:</span>
              <span className="font-mono text-slate-300 font-bold">{file.currentVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">New Revision Target:</span>
              <span className="font-mono text-amber-400 font-bold">{nextVerNumber}</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={loadRevisedSample}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Auto-generate revised payload for testing
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">New Revision File:</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
            />
            {selectedFile && (
              <p className="text-[11px] text-emerald-400 mt-1">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Revision Changelog / Reason:
            </label>
            <textarea
              value={changeLog}
              onChange={(e) => setChangeLog(e.target.value)}
              placeholder="e.g. Updated case depth profile after second tempering cycle..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !selectedFile}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? 'Encrypting Version...' : `Release ${nextVerNumber}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

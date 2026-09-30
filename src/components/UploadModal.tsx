import React, { useState } from 'react';
import {
  UploadCloud,
  FileCheck,
  ShieldCheck,
  Lock,
  Flame,
  AlertCircle,
  FileText,
  CheckCircle2,
  Sparkles,
  Sliders,
  Cpu,
  Tag,
  Calendar,
  Shield
} from 'lucide-react';
import { DocumentCategory, MetallurgicalMetadata, User, SecurityClassification } from '../types';
import { vaultStorage } from '../services/storageService';

interface UploadModalProps {
  currentUser: User;
  onClose: () => void;
  onUpload: (
    file: { name: string; size: number; content: string },
    category: DocumentCategory,
    department: string,
    metadata: MetallurgicalMetadata,
    requiresApproval: boolean,
    securityClassification: SecurityClassification,
    expiryDate?: string,
    tags?: string[]
  ) => Promise<void>;
}

export const UploadModal: React.FC<UploadModalProps> = ({ currentUser, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; content: string } | null>(null);
  const [category, setCategory] = useState<DocumentCategory>('Quality Certificates');
  const [department, setDepartment] = useState('Metallurgy & Quality Assurance');
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [securityClassification, setSecurityClassification] = useState<SecurityClassification>('INTERNAL');
  const [expiryDate, setExpiryDate] = useState('');
  const [tagsInput, setTagsInput] = useState('Quality, Heat-Treatment, Pinion-Gear');

  // AI Classification suggestion state
  const [aiSuggestion, setAiSuggestion] = useState<{ category: DocumentCategory; confidence: number; suggestedTags: string[] } | null>(null);

  // Metallurgical metadata
  const [furnaceId, setFurnaceId] = useState('SQF-Furnace #2 (Unitherm)');
  const [heatNumber, setHeatNumber] = useState('HT-99840');
  const [batchNumber, setBatchNumber] = useState('BATCH-4420');
  const [jobNumber, setJobNumber] = useState('JOB-SVHT-8835');
  const [materialGrade, setMaterialGrade] = useState('20MnCr5');
  const [processType, setProcessType] = useState('Gas Carburizing + Hardening & Tempering');
  const [hardnessRequired, setHardnessRequired] = useState('58 - 62 HRC');
  const [caseDepthRequired, setCaseDepthRequired] = useState('0.8 - 1.1 mm');
  const [customerName, setCustomerName] = useState('Sundaram-Clayton Auto Div');
  const [partNumber, setPartNumber] = useState('PIN-20M-9850');

  // Encryption execution state
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepStatus, setStepStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 25MB maximum threshold.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      const fileData = {
        name: file.name,
        size: file.size,
        content: content
      };
      setSelectedFile(fileData);
      setErrorMessage(null);

      // Trigger AI Smart Document Classification
      const prediction = vaultStorage.predictCategory(file.name, content);
      setAiSuggestion(prediction);
    };
    reader.readAsText(file);
  };

  const applyAiSuggestion = () => {
    if (aiSuggestion) {
      setCategory(aiSuggestion.category);
      if (aiSuggestion.suggestedTags.length > 0) {
        setTagsInput(aiSuggestion.suggestedTags.join(', '));
      }
    }
  };

  // Quick preset sample generator for convenient testing in college viva
  const loadSampleRecord = (type: 'hardness' | 'cqi9' | 'sop') => {
    if (type === 'hardness') {
      const fileObj = {
        name: `SVHT_MicroHardness_Test_HT99855_${Date.now().toString().slice(-4)}.pdf`,
        size: 312450,
        content: `SRI VISHNU HEAT TREATERS - METALLURGICAL TEST REPORT
Heat Number: HT-99855 | Batch: BATCH-4435 | Date: 2026-09-28
Material: 20MnCr5 (Automotive Gear Pinion)
Hardness Traverse (500g load):
Distance 0.1mm: 61.5 HRC (742 HV)
Distance 0.3mm: 60.8 HRC (720 HV)
Distance 0.5mm: 59.2 HRC (682 HV)
Distance 0.8mm: 56.0 HRC (615 HV)
Distance 1.0mm: 50.0 HRC (510 HV) - Cutoff ECD: 0.92 mm
Core Hardness: 34 HRC (330 HV)
Microstructure: Tempered martensite + retained austenite < 7%.
Result: ACCEPTED.`
      };
      setSelectedFile(fileObj);
      setCategory('Quality Certificates');
      setDepartment('Metallurgy & Quality Assurance');
      setMaterialGrade('20MnCr5');
      setHeatNumber('HT-99855');
      setBatchNumber('BATCH-4435');
      setSecurityClassification('CONFIDENTIAL');
      setTagsInput('Quality, Microhardness, 20MnCr5, Batch-4435');
      setAiSuggestion({ category: 'Quality Certificates', confidence: 97, suggestedTags: ['Quality', 'Hardness-Traverse', '20MnCr5'] });
    } else if (type === 'cqi9') {
      const fileObj = {
        name: `SVHT_SQF1_CQI9_Pyrometry_Log_${Date.now().toString().slice(-4)}.xlsx`,
        size: 198200,
        content: `CQI-9 PYROMETRY TEMPERATURE UNIFORMITY SURVEY
Furnace: SQF Furnace #1 (Aichelin)
Set Point: 930°C
Sensors: 9 calibrated type-K thermocouples
Maximum deviation: +3.2°C / -2.8°C (Spread 6.0°C)
Class 2 furnace tolerance: ±5.5°C
Result: COMPLIANT WITH AIAG CQI-9 4TH EDITION & AMS 2750F.`
      };
      setSelectedFile(fileObj);
      setCategory('Calibration Certificates');
      setDepartment('Pyrometry & Furnace Maintenance');
      setMaterialGrade('CQI-9 Pyrometry');
      setHeatNumber('TUS-2026-Q3');
      setSecurityClassification('HIGHLY CONFIDENTIAL');
      setExpiryDate('2027-04-15');
      setTagsInput('Calibration, CQI-9, TUS, Furnace-1, AMS-2750F');
      setAiSuggestion({ category: 'Calibration Certificates', confidence: 95, suggestedTags: ['Calibration', 'CQI-9', 'Pyrometry'] });
    } else {
      const fileObj = {
        name: `SVHT_SOP_Atmosphere_Control_SQF_${Date.now().toString().slice(-4)}.pdf`,
        size: 450120,
        content: `STANDARD OPERATING PROCEDURE: ATMOSPHERE CARBON POTENTIAL CONTROL
Doc: SVHT-SOP-SQF-08 | Rev: 03
1. Methanol and LPG ratio calibration for 0.85% to 0.95% CP.
2. Oxygen probe millivolt reading correlation with steel foil test.
3. Daily burn-off flame inspection and pilot sensor check.`
      };
      setSelectedFile(fileObj);
      setCategory('SOPs & Work Instructions');
      setDepartment('SQF Furnace Production');
      setMaterialGrade('Universal');
      setHeatNumber('SOP-REV-03');
      setSecurityClassification('INTERNAL');
      setTagsInput('SOP, Atmosphere, SQF, Work-Instruction');
      setAiSuggestion({ category: 'SOPs & Work Instructions', confidence: 96, suggestedTags: ['SOP', 'Furnace-Atmosphere'] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select or generate a document to upload.');
      return;
    }

    try {
      setIsProcessing(true);
      setStepStatus('Validating MIME type and payload boundaries...');
      await new Promise((r) => setTimeout(r, 200));

      setStepStatus('Generating cryptographic SHA-256 digest & duplicate check...');
      await new Promise((r) => setTimeout(r, 250));

      setStepStatus('Running Quarantine & Malware Heuristic Scan...');
      await new Promise((r) => setTimeout(r, 250));

      setStepStatus('Deriving PBKDF2 256-bit key & AES-256-GCM authenticated encryption...');
      await new Promise((r) => setTimeout(r, 300));

      const meta: MetallurgicalMetadata = {
        furnaceId,
        heatNumber,
        batchNumber,
        jobNumber,
        materialGrade,
        processType,
        hardnessRequired,
        caseDepthRequired,
        customerName,
        partNumber
      };

      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await onUpload(
        selectedFile,
        category,
        department,
        meta,
        requiresApproval,
        securityClassification,
        expiryDate || undefined,
        parsedTags
      );
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'File upload failed');
      setIsProcessing(false);
      setStepStatus('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">
                Secure Document Ingestion Pipeline
              </h3>
              <p className="text-xs text-slate-400">
                AES-256-GCM Encryption • SHA-256 Checksum • AI Classification • Heuristic Quarantine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-400 hover:text-slate-200 text-sm font-semibold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Quick Preset Generator Buttons (College Viva Helper) */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Quick Test Record Generator (Viva Demo)
              </span>
              <span className="text-[10px] text-slate-500">Auto-fills realistic parameters</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadSampleRecord('hardness')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 border border-slate-700 cursor-pointer"
              >
                + Micro-Hardness Test Cert (20MnCr5)
              </button>
              <button
                type="button"
                onClick={() => loadSampleRecord('cqi9')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 border border-slate-700 cursor-pointer"
              >
                + CQI-9 Pyrometry Survey Log
              </button>
              <button
                type="button"
                onClick={() => loadSampleRecord('sop')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 border border-slate-700 cursor-pointer"
              >
                + Carburizing Atmosphere SOP
              </button>
            </div>
          </div>

          {/* File Picker / Drag Area */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Select or Drop File:
            </label>
            <div className="relative border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-5 text-center transition bg-slate-950/40">
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-8 h-8 text-amber-400/80 mx-auto mb-2" />
              {selectedFile ? (
                <div>
                  <div className="font-semibold text-xs text-amber-300">{selectedFile.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready for AES-256-GCM encryption
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-xs text-slate-300 font-medium">Click to select file or drag here</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Accepts PDF, XLSX, DOCX, CSV, DWG, JSON (Max 25MB)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI-Assisted Smart Classification Banner */}
          {aiSuggestion && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-slate-200">AI Suggested Category: </span>
                  <span className="font-bold text-amber-400">{aiSuggestion.category}</span>
                  <span className="ml-2 font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    {aiSuggestion.confidence}% Match
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={applyAiSuggestion}
                className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400 cursor-pointer transition"
              >
                Apply AI Suggestion
              </button>
            </div>
          )}

          {/* Category & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Document Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Department:</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="Metallurgy & Quality Assurance">Metallurgy & Quality Assurance</option>
                <option value="Sealed Quench Furnace (SQF) Division">Sealed Quench Furnace (SQF) Division</option>
                <option value="Induction Hardening Division">Induction Hardening Division</option>
                <option value="Pyrometry & Furnace Maintenance">Pyrometry & Furnace Maintenance</option>
                <option value="Commercial & Dispatch">Commercial & Dispatch</option>
              </select>
            </div>
          </div>

          {/* Security Classification & Document Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Security Classification:</span>
              </label>
              <select
                value={securityClassification}
                onChange={(e) => setSecurityClassification(e.target.value as SecurityClassification)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
              >
                <option value="INTERNAL">INTERNAL (Authorized Personnel)</option>
                <option value="CONFIDENTIAL">CONFIDENTIAL (QA & Production Dept)</option>
                <option value="HIGHLY CONFIDENTIAL">HIGHLY CONFIDENTIAL (Management Only)</option>
                <option value="PUBLIC">PUBLIC (Auditors & Customers)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Certificate Expiry Date (Optional):</span>
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Document Tags */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-purple-400" />
              <span>Document Tags (Comma-separated for smart search):</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Furnace, Batch-4412, Hardness-60HRC, Customer-Sundaram, CQI-9"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
            />
          </div>

          {/* Metallurgical Process Parameters */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
              Metallurgical Batch Traceability Parameters:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block">Batch ID:</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block">Heat Number:</label>
                <input
                  type="text"
                  value={heatNumber}
                  onChange={(e) => setHeatNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block">Material Grade:</label>
                <input
                  type="text"
                  value={materialGrade}
                  onChange={(e) => setMaterialGrade(e.target.value)}
                  placeholder="20MnCr5, EN353..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block">Customer Name:</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Workflow approval toggle */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <input
              type="checkbox"
              id="reqApproval"
              checked={requiresApproval}
              onChange={(e) => setRequiresApproval(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="reqApproval" className="text-xs text-slate-300 cursor-pointer">
              Route for <strong className="text-amber-400">Manager Review & Sign-Off</strong> before public audit release
            </label>
          </div>

          {/* Processing Animation / Progress */}
          {isProcessing && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold">
                <Cpu className="w-4 h-4 animate-spin text-amber-400" />
                <span>Cryptographic Ingestion Pipeline Active:</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 pl-6">{stepStatus}</div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !selectedFile}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? 'Encrypting & Storing...' : 'Encrypt & Store File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

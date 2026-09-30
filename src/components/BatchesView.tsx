import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Flame,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Search,
  ChevronRight,
  Eye,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  Thermometer,
  User,
  Calendar,
  Sparkles
} from 'lucide-react';
import { HeatTreatmentBatch, DocumentFile, User as UserType } from '../types';

interface BatchesViewProps {
  batches: HeatTreatmentBatch[];
  files: DocumentFile[];
  currentUser: UserType;
  onCreateBatch: (batchData: Omit<HeatTreatmentBatch, 'id'>) => void;
  onUpdateBatchStatus: (batchId: string, status: HeatTreatmentBatch['qualityStatus'], remarks?: string) => void;
  onSelectFile: (file: DocumentFile) => void;
  onOpenUpload: () => void;
}

export const BatchesView: React.FC<BatchesViewProps> = ({
  batches,
  files,
  currentUser,
  onCreateBatch,
  onUpdateBatchStatus,
  onSelectFile,
  onOpenUpload
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<HeatTreatmentBatch | null>(null);

  // New batch form state
  const [batchId, setBatchId] = useState(`BATCH-${Math.floor(Math.random() * 900 + 4420)}`);
  const [jobNumber, setJobNumber] = useState(`JOB-SVHT-${Math.floor(Math.random() * 900 + 8830)}`);
  const [customerName, setCustomerName] = useState('Sundaram-Clayton Auto Div');
  const [partName, setPartName] = useState('Helical Pinion Gear 24T');
  const [materialType, setMaterialType] = useState('Case Hardening Alloy Steel');
  const [materialGrade, setMaterialGrade] = useState('20MnCr5');
  const [furnaceName, setFurnaceName] = useState('Sealed Quench Furnace #2 (Unitherm)');
  const [heatTreatmentType, setHeatTreatmentType] = useState('Gas Carburizing + Direct Quench + Temper');
  const [temperatureC, setTemperatureC] = useState(930);
  const [durationHrs, setDurationHrs] = useState(7.0);
  const [operatorName, setOperatorName] = useState('Suresh Kumar');

  const filteredBatches = batches.filter((b) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = b.batchId.toLowerCase().includes(q);
      const matchCustomer = b.customerName.toLowerCase().includes(q);
      const matchJob = b.jobNumber.toLowerCase().includes(q);
      const matchPart = b.partName.toLowerCase().includes(q);
      const matchGrade = b.materialGrade.toLowerCase().includes(q);
      if (!matchId && !matchCustomer && !matchJob && !matchPart && !matchGrade) return false;
    }
    if (filterStatus !== 'ALL' && b.qualityStatus !== filterStatus) return false;
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateBatch({
      batchId,
      jobNumber,
      customerName,
      partName,
      materialType,
      materialGrade,
      furnaceId: 'FURN-SQF-02',
      furnaceName,
      heatTreatmentType,
      temperatureC: Number(temperatureC),
      treatmentDurationHrs: Number(durationHrs),
      operatorName,
      productionDate: new Date().toISOString().split('T')[0],
      inspectionStatus: 'Pending Inspection',
      qualityStatus: 'In Progress',
      attachedDocIds: []
    });
    setShowCreateModal(false);
  };

  const getStatusBadge = (status: HeatTreatmentBatch['qualityStatus']) => {
    switch (status) {
      case 'Quality Passed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Rejected / Rework':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Under Inspection':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            Heat-Treatment Batch Management Module
          </h2>
          <p className="text-xs text-slate-400">
            Traceability Pipeline: Customer → Job Number → Batch ID → Furnace Thermal Cycle → QA Certification
          </p>
        </div>

        {currentUser.role !== 'Viewer' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Heat-Treatment Batch</span>
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
            placeholder="Search Batch ID (BATCH-4412), Job Number, Customer, Part Name, or Grade..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none"
        >
          <option value="ALL">All Quality Statuses</option>
          <option value="In Progress">In Progress</option>
          <option value="Under Inspection">Under Inspection</option>
          <option value="Quality Passed">Quality Passed</option>
          <option value="Rejected / Rework">Rejected / Rework</option>
        </select>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBatches.map((batch) => {
          const attachedFiles = files.filter((f) => batch.attachedDocIds.includes(f.id));

          return (
            <div
              key={batch.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {batch.batchId}
                    </span>
                    <span className="ml-2 font-mono text-[10px] text-slate-500">{batch.jobNumber}</span>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusBadge(batch.qualityStatus)}`}>
                    {batch.qualityStatus}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-100">{batch.partName}</h4>
                  <div className="text-xs text-slate-400">{batch.customerName}</div>
                </div>

                {/* Thermal Process Parameters */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Material Grade:</span>
                    <span className="font-mono text-slate-200 font-semibold">{batch.materialGrade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Furnace Unit:</span>
                    <span className="text-slate-300 truncate max-w-[150px]">{batch.furnaceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Process Temp / Time:</span>
                    <span className="font-mono text-amber-300 font-semibold">{batch.temperatureC}°C ({batch.treatmentDurationHrs}h)</span>
                  </div>
                  {batch.hardnessMeasuredHRC && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Hardness Observed:</span>
                      <span className="font-mono text-emerald-400 font-bold">{batch.hardnessMeasuredHRC}</span>
                    </div>
                  )}
                  {batch.effectiveCaseDepthMm && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Effective Case Depth:</span>
                      <span className="font-mono text-emerald-400 font-bold">{batch.effectiveCaseDepthMm}</span>
                    </div>
                  )}
                </div>

                {/* Attached Documents in Vault */}
                <div className="space-y-1 text-xs">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                    <span>Attached Vault Documents ({attachedFiles.length})</span>
                    <span className="text-[10px] text-amber-400 cursor-pointer hover:underline" onClick={onOpenUpload}>
                      + Attach
                    </span>
                  </span>
                  {attachedFiles.length === 0 ? (
                    <div className="text-[11px] text-slate-500 italic p-2 rounded bg-slate-950/40">
                      No certificates attached yet.
                    </div>
                  ) : (
                    attachedFiles.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => onSelectFile(doc)}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/40 cursor-pointer flex items-center justify-between text-[11px]"
                      >
                        <span className="font-medium text-slate-300 truncate max-w-[200px]">{doc.fileName}</span>
                        <Eye className="w-3.5 h-3.5 text-slate-400 hover:text-amber-400 shrink-0" />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action buttons */}
              {(currentUser.role === 'Admin' || currentUser.role === 'Manager') && (
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Lead: {batch.operatorName}</span>
                  <div className="flex items-center gap-1.5">
                    {batch.qualityStatus !== 'Quality Passed' && (
                      <button
                        onClick={() => onUpdateBatchStatus(batch.id, 'Quality Passed', 'Traverse cut approved by metallurgical lab.')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold cursor-pointer"
                      >
                        Pass QA
                      </button>
                    )}
                    {batch.qualityStatus !== 'Rejected / Rework' && (
                      <button
                        onClick={() => onUpdateBatchStatus(batch.id, 'Rejected / Rework', 'Core hardness below specification.')}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-semibold cursor-pointer"
                      >
                        Rework
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Batch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <span>Initialize Heat-Treatment Batch</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Batch ID:</label>
                  <input
                    type="text"
                    required
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Job Number:</label>
                  <input
                    type="text"
                    required
                    value={jobNumber}
                    onChange={(e) => setJobNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Customer Organization:</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Part / Component Name:</label>
                  <input
                    type="text"
                    required
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Material Grade:</label>
                  <input
                    type="text"
                    required
                    value={materialGrade}
                    onChange={(e) => setMaterialGrade(e.target.value)}
                    placeholder="20MnCr5, EN353, SAE 8620..."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Furnace Unit:</label>
                  <select
                    value={furnaceName}
                    onChange={(e) => setFurnaceName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    <option value="Sealed Quench Furnace #1 (Aichelin)">SQF #1 (Aichelin)</option>
                    <option value="Sealed Quench Furnace #2 (Unitherm)">SQF #2 (Unitherm)</option>
                    <option value="High Frequency Induction Scanner 100kW">Induction Scanner 100kW</option>
                    <option value="Pit Tempering & Stress Relieving Furnace #3">Pit Tempering #3</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Temperature (°C):</label>
                  <input
                    type="number"
                    value={temperatureC}
                    onChange={(e) => setTemperatureC(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Cycle Duration (Hrs):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={durationHrs}
                    onChange={(e) => setDurationHrs(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Operator Incharge:</label>
                  <input
                    type="text"
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Create Batch Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

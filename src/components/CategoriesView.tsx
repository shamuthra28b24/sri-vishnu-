import React, { useState } from 'react';
import {
  Layers,
  Flame,
  FileCheck,
  FileText,
  ShieldAlert,
  HardDrive,
  Users,
  Receipt,
  Truck,
  Wrench,
  BookOpen,
  ClipboardCheck,
  ChevronRight,
  Eye,
  Download,
  Lock
} from 'lucide-react';
import { DocumentCategory, DocumentFile, User } from '../types';

interface CategoriesViewProps {
  files: DocumentFile[];
  currentUser: User;
  onSelectCategoryFilter: (category: DocumentCategory) => void;
  onSelectFile: (file: DocumentFile) => void;
  onDownloadFile: (file: DocumentFile) => void;
}

interface CategoryInfo {
  name: DocumentCategory;
  code: string;
  icon: any;
  description: string;
  retentionPeriod: string;
  complianceRef: string;
  badgeColor: string;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  files,
  currentUser,
  onSelectCategoryFilter,
  onSelectFile,
  onDownloadFile
}) => {
  const [selectedCat, setSelectedCat] = useState<DocumentCategory | null>(null);

  const activeFiles = files.filter((f) => !f.isDeleted);

  const categories: CategoryInfo[] = [
    {
      name: 'Production Reports',
      code: 'PRD',
      icon: Flame,
      description: 'Furnace charge load sheets, quenching oil agitation rates, shift production logs, and furnace output tallies.',
      retentionPeriod: '5 Years',
      complianceRef: 'CQI-9 Special Process Table 3.1',
      badgeColor: 'from-orange-500/20 to-amber-500/20 text-orange-400 border-orange-500/30'
    },
    {
      name: 'Heat-Treatment Records',
      code: 'HTR',
      icon: Flame,
      description: 'Time-Temperature-Atmosphere charts, carbon potential (%CP) boost/diffuse curves, and quench cooling rates.',
      retentionPeriod: '10 Years',
      complianceRef: 'IATF 16949:2016 Clause 7.5.3',
      badgeColor: 'from-red-500/20 to-orange-500/20 text-red-400 border-red-500/30'
    },
    {
      name: 'Quality Certificates',
      code: 'QCR',
      icon: FileCheck,
      description: 'Customer test certificates, Rockwell/Vickers microhardness traverses, case depth certification, and microphotographs.',
      retentionPeriod: '15 Years',
      complianceRef: 'ASTM E384 / ISO 6507-1',
      badgeColor: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
    },
    {
      name: 'Inspection Reports',
      code: 'INS',
      icon: ClipboardCheck,
      description: 'Dimensional CMM inspections, magnetic particle NDT crack detection, surface decarburization, and grain size ratings.',
      retentionPeriod: '10 Years',
      complianceRef: 'ASTM E45 / ASTM E112',
      badgeColor: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30'
    },
    {
      name: 'Customer Documents',
      code: 'CUS',
      icon: FileText,
      description: 'Automotive OEM and Tier-1 engineering drawings, heat treatment specifications, purchase agreements, and technical criteria.',
      retentionPeriod: 'Current + 7 Years',
      complianceRef: 'OEM Customer Specific Requirements (CSR)',
      badgeColor: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30'
    },
    {
      name: 'Employee Records',
      code: 'EMP',
      icon: Users,
      description: 'Metallurgist certifications, NDT Level-II inspection qualifications, pyrometry survey operator certifications, and safety records.',
      retentionPeriod: 'Employment + 10 Years',
      complianceRef: 'ISO 9001 Clause 7.2 Competence',
      badgeColor: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30'
    },
    {
      name: 'Invoices & Commercials',
      code: 'INV',
      icon: Receipt,
      description: 'Job work delivery challans, customer tax invoices, weighment slips, and heat-treatment commercial processing billing.',
      retentionPeriod: '8 Years',
      complianceRef: 'GST / Statutory Commercial Compliance',
      badgeColor: 'from-yellow-500/20 to-amber-500/20 text-yellow-400 border-yellow-500/30'
    },
    {
      name: 'Purchase & MTR',
      code: 'MTR',
      icon: Truck,
      description: 'Raw steel Mill Test Reports (MTR), quench oil batch chemical analysis, LPG/Methanol atmosphere raw gas delivery certificates.',
      retentionPeriod: '10 Years',
      complianceRef: 'EN 10204 3.1 Mill Inspection Certs',
      badgeColor: 'from-lime-500/20 to-emerald-500/20 text-lime-400 border-lime-500/30'
    },
    {
      name: 'Maintenance Records',
      code: 'MNT',
      icon: Wrench,
      description: 'Temperature Uniformity Surveys (TUS), System Accuracy Tests (SAT), thermocouple calibration certificates, and furnace burner servicing.',
      retentionPeriod: '5 Years',
      complianceRef: 'AMS 2750F Pyrometry Specification',
      badgeColor: 'from-slate-500/20 to-zinc-500/20 text-slate-300 border-slate-500/30'
    },
    {
      name: 'SOPs & Work Instructions',
      code: 'SOP',
      icon: BookOpen,
      description: 'Plant Standard Operating Procedures, furnace recipes for 20MnCr5/EN353/SAE8620, emergency atmosphere flare procedures.',
      retentionPeriod: 'Permanent (Active Revision)',
      complianceRef: 'IATF 16949 Clause 8.5.1 Control of Work',
      badgeColor: 'from-violet-500/20 to-indigo-500/20 text-violet-400 border-violet-500/30'
    },
    {
      name: 'Audit Documents',
      code: 'AUD',
      icon: ShieldAlert,
      description: 'TUV / DNV IATF 16949 audit reports, internal QMS audit non-conformance logs, Corrective Action Reports (CAPA), and customer audit signoffs.',
      retentionPeriod: '10 Years',
      complianceRef: 'IATF 16949 Clause 9.2 Internal Audit',
      badgeColor: 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30'
    }
  ];

  const selectedCatFiles = selectedCat
    ? activeFiles.filter((f) => f.category === selectedCat)
    : [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-400" />
          Document Taxonomy & Regulatory Categories
        </h2>
        <p className="text-xs text-slate-400">
          11 Metallurgical document classifications governed by ISO 9001:2015, IATF 16949, and AIAG CQI-9 retention policies.
        </p>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const count = activeFiles.filter((f) => f.category === cat.name).length;
          const isSelected = selectedCat === cat.name;

          return (
            <div
              key={cat.name}
              onClick={() => setSelectedCat(isSelected ? null : cat.name)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-amber-500/60 shadow-xl shadow-amber-950/20 ring-1 ring-amber-500/30'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900 shadow-lg'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className={`p-2.5 rounded-xl border bg-gradient-to-br ${cat.badgeColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-amber-400">
                      {count} {count === 1 ? 'file' : 'files'}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">{cat.code}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-base text-slate-100">{cat.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span className="text-slate-500">Retention:</span>
                  <span className="font-medium text-slate-300">{cat.retentionPeriod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Standard:</span>
                  <span className="font-mono text-[10px] text-amber-300/80 truncate max-w-[170px]">{cat.complianceRef}</span>
                </div>
                <div className="pt-2 flex justify-between items-center text-xs text-amber-400 font-semibold">
                  <span>{isSelected ? 'Collapse files' : 'Inspect category files'}</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Category Files Drawer / List */}
      {selectedCat && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-amber-500/40 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30">
                CATEGORY DRILLDOWN
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                {selectedCat} ({selectedCatFiles.length} Records)
              </h3>
            </div>
            <button
              onClick={() => onSelectCategoryFilter(selectedCat)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition cursor-pointer"
            >
              Open in Document Vault →
            </button>
          </div>

          {selectedCatFiles.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No documents currently uploaded under this category.</p>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {selectedCatFiles.map((file) => (
                <div key={file.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-[10px] text-amber-400 uppercase">
                      {file.fileExtension}
                    </div>
                    <div>
                      <div
                        onClick={() => onSelectFile(file)}
                        className="font-semibold text-slate-100 hover:text-amber-400 cursor-pointer"
                      >
                        {file.fileName}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span>{(file.fileSizeBytes / 1024).toFixed(1)} KB</span>
                        {file.metadata.heatNumber && <span className="text-amber-300">Heat: {file.metadata.heatNumber}</span>}
                        {file.metadata.materialGrade && <span>Grade: {file.metadata.materialGrade}</span>}
                        <span>• Ver: {file.currentVersion}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectFile(file)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Inspect"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {file.permissions.canDownload.includes(currentUser.role) && (
                      <button
                        onClick={() => onDownloadFile(file)}
                        className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 cursor-pointer"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

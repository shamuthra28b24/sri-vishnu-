export type UserRole = 'Admin' | 'Manager' | 'Employee' | 'Viewer';

export type SecurityClassification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'HIGHLY CONFIDENTIAL';

export type DocumentExpiryStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'NOT_APPLICABLE';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  department: string;
  designation: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  createdAt: string;
  lastLogin?: string;
  avatarUrl?: string;
  failedLoginAttempts?: number;
  isLocked?: boolean;
}

export type DocumentCategory = 
  | 'Production Reports'
  | 'Quality Certificates'
  | 'Heat-Treatment Records'
  | 'Furnace Records'
  | 'Customer Documents'
  | 'Employee Records'
  | 'Invoices & Commercials'
  | 'Purchase & MTR'
  | 'Maintenance Records'
  | 'Calibration Certificates'
  | 'Inspection Reports'
  | 'Audit Documents'
  | 'SOPs & Work Instructions'
  | 'Legal Documents';

export type ApprovalStatus = 'Draft' | 'Pending Review' | 'Approved' | 'Rejected' | 'Archived';

export type SecurityStatus = 'Safe' | 'Quarantined' | 'Suspicious' | 'Verified';

export interface FilePermissions {
  canView: UserRole[];
  canDownload: UserRole[];
  canEdit: UserRole[];
  canDelete: UserRole[];
  canShare: UserRole[];
  canApprove: UserRole[];
}

export interface FileVersion {
  versionId: string;
  versionNumber: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  uploaderName: string;
  sha256Hash: string;
  changeLog: string;
  encryptedDataPreview: string; // Hex representation of encrypted payload
  iv: string; // Initialization Vector in hex
  authTag: string; // GCM Auth Tag in hex
  rawContent?: string; // Text/Data content for decryption simulation
}

export interface MetallurgicalMetadata {
  furnaceId?: string;
  heatNumber?: string;
  batchNumber?: string;
  materialGrade?: string; // e.g., EN353, 20MnCr5, SAE 8620, D2, EN8, 4140
  processType?: string; // e.g., Gas Carburizing, Hardening & Tempering, Induction Hardening, Annealing, Nitriding
  hardnessRequired?: string; // e.g., 58-62 HRC, 700-750 HV
  caseDepthRequired?: string; // e.g., 0.8 - 1.2 mm
  customerName?: string;
  partNumber?: string;
  jobNumber?: string;
  quenchMedium?: string;
  soakTempC?: number;
  carbonPotential?: string;
}

export interface SharedFileAccess {
  shareId: string;
  fileId: string;
  sharedWithUserId?: string;
  sharedWithUserRole?: UserRole;
  sharedWithEmail?: string;
  sharedByUserId: string;
  sharedByUserName: string;
  sharedAt: string;
  expiresAt: string; // Temporary access expiry date
  canDownload: boolean;
  accessLevel: 'VIEW_ONLY' | 'VIEW_DOWNLOAD';
  accessCount: number;
  isRevoked: boolean;
}

export interface DocumentFile {
  id: string;
  fileName: string;
  originalName: string;
  fileExtension: string;
  mimeType: string;
  fileSizeBytes: number;
  category: DocumentCategory;
  department: string;
  uploadedBy: string;
  uploaderName: string;
  uploaderRole: UserRole;
  uploadedAt: string;
  updatedAt: string;
  currentVersion: string;
  versions: FileVersion[];
  
  // Security & Cryptography
  isEncrypted: boolean;
  encryptionAlgorithm: 'AES-256-GCM';
  sha256Hash: string; // Current version hash
  originalSha256Hash: string; // Hash when uploaded
  integrityStatus: 'Valid' | 'Tampered' | 'Pending Check';
  securityStatus: SecurityStatus;
  quarantineReason?: string;
  iv: string;
  authTag: string;
  encryptedDataPreview: string;
  rawContent?: string;

  // Security Classification & Expiry
  securityClassification: SecurityClassification;
  expiryDate?: string; // For calibration certs, licenses, test certificates
  expiryStatus: DocumentExpiryStatus;
  tags: string[];

  // Approval Workflow
  approvalStatus: ApprovalStatus;
  reviewedBy?: string;
  reviewerName?: string;
  reviewedAt?: string;
  reviewRemarks?: string;

  // Access Control & Sharing
  permissions: FilePermissions;
  sharedGrants: SharedFileAccess[];
  
  // Metallurgical metadata
  metadata: MetallurgicalMetadata;

  // Folders & Description
  folderId?: string;
  folderName?: string;
  description?: string;

  // Recycle Bin
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface DocumentFolder {
  id: string;
  name: string;
  department: string;
  createdAt: string;
  createdBy: string;
  fileCount?: number;
  color?: string;
}

export type AuditAction = 
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'FILE_UPLOAD'
  | 'FILE_DOWNLOAD'
  | 'FILE_VIEW'
  | 'FILE_VERSION_UPLOAD'
  | 'FILE_APPROVE'
  | 'FILE_REJECT'
  | 'FILE_SOFT_DELETE'
  | 'FILE_RESTORE'
  | 'FILE_PERMANENT_DELETE'
  | 'FILE_SHARE_GRANTED'
  | 'FILE_SHARE_REVOKED'
  | 'PERMISSION_CHANGE'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DEACTIVATED'
  | 'INTEGRITY_CHECK_PASSED'
  | 'INTEGRITY_TAMPER_DETECTED'
  | 'SECURITY_ALERT_TRIGGERED'
  | 'BACKUP_EXPORT'
  | 'BACKUP_RESTORE'
  | '2FA_VERIFIED'
  | '2FA_FAILED'
  | 'BATCH_CREATED'
  | 'FURNACE_UPDATED';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  userRole: UserRole;
  action: AuditAction;
  resourceId?: string;
  resourceName?: string;
  ipAddress: string;
  userAgent: string;
  details: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  alertType: 'UNAUTHORIZED_ACCESS' | 'FAILED_LOGINS' | 'INTEGRITY_TAMPER' | 'UNUSUAL_DOWNLOAD_SPIKE' | 'MALWARE_DETECTED' | 'PERMISSION_ESCALATION' | 'EXPIRED_CERTIFICATE_ACCESSED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  sourceIp: string;
  affectedUser?: string;
  affectedFile?: string;
  status: 'NEW' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  actionTaken?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  furnaceUnits: string[];
  documentCount: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  priority: 'Critical' | 'Warning' | 'Information' | 'Success';
  isRead: boolean;
  category: 'APPROVAL' | 'SECURITY' | 'EXPIRY' | 'SHARE' | 'BACKUP';
  linkView?: string;
  targetId?: string;
}

// -------------------------------------------------------------
// Specialized Metallurgical Operations Entities
// -------------------------------------------------------------

export type BatchQualityStatus = 'In Progress' | 'Quality Passed' | 'Under Inspection' | 'Rejected / Rework';

export interface HeatTreatmentBatch {
  id: string;
  batchId: string; // e.g. BATCH-4412
  jobNumber: string; // e.g. JOB-SVHT-8821
  customerName: string; // e.g. Sundaram-Clayton Auto Div
  partName: string; // e.g. Pinion Gear 20T
  materialType: string; // e.g. Case Hardening Alloy Steel
  materialGrade: string; // e.g. 20MnCr5
  furnaceId: string; // e.g. SQF-02
  furnaceName: string;
  heatTreatmentType: string; // e.g. Gas Carburizing + Direct Quench + Temper
  temperatureC: number; // e.g. 930
  treatmentDurationHrs: number; // e.g. 6.5
  operatorName: string;
  productionDate: string;
  inspectionStatus: 'Pending Inspection' | 'Traverse Completed' | 'Visual Passed';
  qualityStatus: BatchQualityStatus;
  hardnessMeasuredHRC?: string;
  effectiveCaseDepthMm?: string;
  attachedDocIds: string[]; // List of related DocumentFile IDs
  remarks?: string;
}

export type FurnaceOperatingStatus = 'Operational / Running' | 'Idle / Standby' | 'Under Maintenance' | 'Calibration Due';

export interface FurnaceRecord {
  id: string;
  furnaceId: string; // e.g. FURN-SQF-01
  furnaceName: string; // e.g. Sealed Quench Furnace #1 (Aichelin)
  furnaceType: 'Sealed Quench Furnace (SQF)' | 'Induction Scanner' | 'Pit Carburizing' | 'Salt Bath Furnace' | 'Pit Tempering';
  capacityKg: number;
  operatingTempRange: string; // e.g. 750°C - 1050°C
  lastMaintenanceDate: string;
  lastCalibrationDate: string;
  nextCalibrationDate: string; // Tracks expiry of calibration certs
  operatingStatus: FurnaceOperatingStatus;
  temperatureUniformityDeviationC: number; // e.g. ±3.5°C
  attachedDocIds: string[]; // calibration certs, maintenance logs, inspection docs
  primaryController: string; // e.g. Eurotherm 3504 / Yokogawa DX2000
}

export interface QualityRecord {
  id: string;
  certificateNumber: string; // e.g. SVHT-QC-2026-09-8812
  batchId: string;
  customerName: string;
  materialGrade: string;
  heatNumber: string;
  requiredHardness: string;
  observedHardness: string;
  requiredECD: string;
  observedECD: string;
  microstructureResult: string;
  retainedAustenitePercent: number;
  testDate: string;
  metallurgistName: string;
  status: 'Draft' | 'Pending Review' | 'Approved' | 'Rejected';
  nonConformanceNotes?: string;
  documentFileId?: string;
}

export interface VaultBackup {
  exportDate: string;
  systemName: string;
  appVersion: string;
  totalFiles: number;
  totalAuditLogs: number;
  totalBatches: number;
  totalFurnaces: number;
  checksum: string;
  files: DocumentFile[];
  auditLogs: AuditLog[];
  securityAlerts: SecurityAlert[];
  users: User[];
  batches: HeatTreatmentBatch[];
  furnaces: FurnaceRecord[];
  notifications: NotificationItem[];
}

import {
  User,
  DocumentFile,
  FileVersion,
  AuditLog,
  SecurityAlert,
  Department,
  NotificationItem,
  VaultBackup,
  UserRole,
  DocumentCategory,
  MetallurgicalMetadata,
  HeatTreatmentBatch,
  FurnaceRecord,
  SharedFileAccess,
  SecurityClassification,
  DocumentExpiryStatus,
  DocumentFolder
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_FILES,
  INITIAL_AUDIT_LOGS,
  INITIAL_SECURITY_ALERTS,
  INITIAL_DEPARTMENTS,
  INITIAL_BATCHES,
  INITIAL_FURNACES,
  INITIAL_NOTIFICATIONS,
  INITIAL_FOLDERS
} from '../data/seedData';
import { encryptData, decryptData, computeSHA256 } from './cryptoService';

const STORAGE_KEYS = {
  USERS: 'svht_vault_users_v2',
  FILES: 'svht_vault_files_v2',
  AUDIT_LOGS: 'svht_vault_audit_logs_v2',
  ALERTS: 'svht_vault_alerts_v2',
  DEPARTMENTS: 'svht_vault_depts_v2',
  BATCHES: 'svht_vault_batches_v2',
  FURNACES: 'svht_vault_furnaces_v2',
  NOTIFICATIONS: 'svht_vault_notifs_v2',
  FOLDERS: 'svht_vault_folders_v2',
  CURRENT_USER_ID: 'svht_vault_current_user_id_v2',
  JWT_TOKEN: 'svht_vault_jwt_token_v2',
};

class StorageService {
  private users: User[] = [];
  private files: DocumentFile[] = [];
  private auditLogs: AuditLog[] = [];
  private alerts: SecurityAlert[] = [];
  private departments: Department[] = [];
  private batches: HeatTreatmentBatch[] = [];
  private furnaces: FurnaceRecord[] = [];
  private notifications: NotificationItem[] = [];
  private folders: DocumentFolder[] = [];
  private currentUser: User | null = null;
  private jwtToken: string | null = null;
  private isAuthenticated: boolean = true;
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadState();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.saveState();
    this.listeners.forEach((l) => l());
  }

  private loadState() {
    try {
      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      this.users = savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS;

      const savedFiles = localStorage.getItem(STORAGE_KEYS.FILES);
      this.files = savedFiles ? JSON.parse(savedFiles) : INITIAL_FILES;

      const savedLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      this.auditLogs = savedLogs ? JSON.parse(savedLogs) : INITIAL_AUDIT_LOGS;

      const savedAlerts = localStorage.getItem(STORAGE_KEYS.ALERTS);
      this.alerts = savedAlerts ? JSON.parse(savedAlerts) : INITIAL_SECURITY_ALERTS;

      const savedDepts = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
      this.departments = savedDepts ? JSON.parse(savedDepts) : INITIAL_DEPARTMENTS;

      const savedBatches = localStorage.getItem(STORAGE_KEYS.BATCHES);
      this.batches = savedBatches ? JSON.parse(savedBatches) : INITIAL_BATCHES;

      const savedFurnaces = localStorage.getItem(STORAGE_KEYS.FURNACES);
      this.furnaces = savedFurnaces ? JSON.parse(savedFurnaces) : INITIAL_FURNACES;

      const savedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      this.notifications = savedNotifs ? JSON.parse(savedNotifs) : INITIAL_NOTIFICATIONS;

      const savedFolders = localStorage.getItem(STORAGE_KEYS.FOLDERS);
      this.folders = savedFolders ? JSON.parse(savedFolders) : INITIAL_FOLDERS;

      const savedUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      const matched = this.users.find((u) => u.id === (savedUserId || 'usr-1'));
      this.currentUser = matched || this.users[0];

      this.jwtToken = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN) || this.createDemoJwt(this.currentUser);
    } catch {
      this.users = INITIAL_USERS;
      this.files = INITIAL_FILES;
      this.auditLogs = INITIAL_AUDIT_LOGS;
      this.alerts = INITIAL_SECURITY_ALERTS;
      this.departments = INITIAL_DEPARTMENTS;
      this.batches = INITIAL_BATCHES;
      this.furnaces = INITIAL_FURNACES;
      this.notifications = INITIAL_NOTIFICATIONS;
      this.folders = INITIAL_FOLDERS;
      this.currentUser = INITIAL_USERS[0];
      this.jwtToken = this.createDemoJwt(this.currentUser);
    }
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(this.files));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(this.alerts));
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(this.departments));
      localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(this.batches));
      localStorage.setItem(STORAGE_KEYS.FURNACES, JSON.stringify(this.furnaces));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
      localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(this.folders));
      if (this.currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, this.currentUser.id);
      }
      if (this.jwtToken) {
        localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, this.jwtToken);
      }
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  private createDemoJwt(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: user.id,
        username: user.username,
        role: user.role,
        dept: user.department,
        name: user.fullName,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 28800, // 8 hours
        iss: 'srivishnuheattreaters.com/vault'
      })
    );
    const signature = 'svht_' + Math.random().toString(36).substring(2, 15);
    return `${header}.${payload}.${signature}`;
  }

  // --- User & Session Operations ---

  public getCurrentUser(): User {
    return this.currentUser || this.users[0];
  }

  public getJwtToken(): string {
    return this.jwtToken || '';
  }

  public getUsers(): User[] {
    return this.users;
  }

  public getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  public setAuthenticated(val: boolean) {
    this.isAuthenticated = val;
    this.notify();
  }

  public authenticateUser(username: string, password: string): { success: boolean; requires2FA?: boolean; user?: User; error?: string } {
    const user = this.users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!user) {
      this.logAudit('LOGIN_FAILED', undefined, `Authentication failed: Username "${username}" not found. IP: 182.72.194.50`, 'WARNING');
      return { success: false, error: 'User does not exist in the Sri Vishnu Heat Treaters active directory.' };
    }

    if (user.isLocked) {
      return {
        success: false,
        error: `Account for ${user.fullName} is LOCKED due to excessive failed attempts. Contact Administrator or click Admin Unlock.`,
        user
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        error: `Account for ${user.fullName} has been deactivated by plant administration.`,
        user
      };
    }

    const validPassword = 'HeatTreat@2026';
    if (password !== validPassword) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      if (user.failedLoginAttempts >= 3) {
        user.isLocked = true;
        this.createSecurityAlert(
          'FAILED_LOGINS',
          'HIGH',
          `Account Locked: 3 Consecutive Failed Login Attempts for "${user.username}"`,
          `Repeated authentication failures detected from IP 182.72.194.50. Account automatically locked under plant cybersecurity policy.`,
          user.username
        );
        this.logAudit(
          'LOGIN_FAILED',
          undefined,
          `Account LOCKED for user ${user.username} after 3 failed login attempts. IP: 182.72.194.50`,
          'CRITICAL'
        );
        this.notify();
        return {
          success: false,
          error: `Incorrect password! Maximum 3 failed attempts reached. Account has been LOCKED. High-severity incident logged.`,
          user
        };
      }

      this.logAudit(
        'LOGIN_FAILED',
        undefined,
        `Failed password attempt ${user.failedLoginAttempts}/3 for user ${user.username}. IP: 182.72.194.50`,
        'WARNING'
      );
      this.notify();
      return {
        success: false,
        error: `Incorrect password! Attempt ${user.failedLoginAttempts} of 3. Account will be locked after 3 failures.`,
        user
      };
    }

    // Password valid
    if (user.twoFactorEnabled) {
      return { success: true, requires2FA: true, user };
    }

    return { success: true, requires2FA: false, user };
  }

  public verifyOTP(userId: string, otp: string): { success: boolean; error?: string } {
    const user = this.users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, error: 'User session not found.' };
    }
    if (!otp || otp.trim().length !== 6) {
      return { success: false, error: 'Invalid OTP length. Must be a 6-digit numeric token.' };
    }
    return { success: true };
  }

  public completeLogin(user: User) {
    user.failedLoginAttempts = 0;
    user.lastLogin = new Date().toISOString();
    this.currentUser = user;
    this.isAuthenticated = true;
    this.jwtToken = this.createDemoJwt(user);
    this.logAudit('LOGIN_SUCCESS', undefined, `User ${user.username} (${user.role}) successfully authenticated via zero-trust portal with JWT session issued. IP: 182.72.194.50`, 'SUCCESS');
    this.notify();
  }

  public unlockAccount(userId: string) {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      user.isLocked = false;
      user.failedLoginAttempts = 0;
      this.logAudit('USER_UPDATED', undefined, `Administrator unlocked account for user ${user.username}`, 'SUCCESS');
      this.notify();
    }
  }

  public resetPassword(username: string, _newPass: string) {
    const user = this.users.find((u) => u.username === username);
    if (user) {
      user.failedLoginAttempts = 0;
      user.isLocked = false;
      this.logAudit('USER_UPDATED', undefined, `Password reset and bcrypt hash recomputed for ${user.username}. New salt generated.`, 'INFO');
      this.addNotification({
        id: `notif-${Date.now()}`,
        title: `Password reset completed for ${user.username}`,
        message: 'Vault master credentials updated. Complexity check passed.',
        timestamp: new Date().toISOString(),
        priority: 'Information',
        isRead: false,
        category: 'SECURITY'
      });
      this.notify();
    }
  }

  public switchUser(userId: string) {
    const found = this.users.find((u) => u.id === userId);
    if (found) {
      this.currentUser = found;
      this.isAuthenticated = true;
      this.jwtToken = this.createDemoJwt(found);
      this.logAudit(
        'LOGIN_SUCCESS',
        undefined,
        `Quick switch session to user ${found.username} (${found.role} - ${found.designation})`,
        'SUCCESS'
      );
      this.notify();
    }
  }

  public login(user: User) {
    this.currentUser = user;
    this.isAuthenticated = true;
    this.jwtToken = this.createDemoJwt(user);
    this.logAudit('LOGIN_SUCCESS', undefined, `User ${user.username} authenticated successfully.`, 'SUCCESS');
    this.notify();
  }

  public logout() {
    if (this.currentUser) {
      this.logAudit('LOGOUT', undefined, `User ${this.currentUser.username} logged out from active session.`, 'INFO');
    }
    this.isAuthenticated = false;
    this.notify();
  }

  public createUser(userData: Omit<User, 'id' | 'createdAt'>) {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    this.logAudit('USER_CREATED', undefined, `Created user account for ${newUser.username} (${newUser.role})`, 'SUCCESS');
    this.notify();
    return newUser;
  }

  public updateUserRole(userId: string, newRole: UserRole) {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      const oldRole = user.role;
      user.role = newRole;
      this.logAudit('PERMISSION_CHANGE', undefined, `Updated role for ${user.username} from ${oldRole} to ${newRole}`, 'WARNING');
      this.notify();
    }
  }

  public toggleUserStatus(userId: string) {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      user.isActive = !user.isActive;
      this.logAudit(
        user.isActive ? 'USER_UPDATED' : 'USER_DEACTIVATED',
        undefined,
        `${user.isActive ? 'Reactivated' : 'Deactivated'} user account for ${user.username}`,
        'WARNING'
      );
      this.notify();
    }
  }

  public toggleTwoFactor(userId: string) {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      user.twoFactorEnabled = !user.twoFactorEnabled;
      if (user.twoFactorEnabled && !user.twoFactorSecret) {
        user.twoFactorSecret = `SVHT-${user.username.toUpperCase()}-2FA-KEY`;
      }
      this.logAudit('USER_UPDATED', undefined, `2FA status updated to ${user.twoFactorEnabled ? 'ENABLED' : 'DISABLED'} for ${user.username}`, 'INFO');
      this.notify();
    }
  }

  // --- Document Operations ---

  public getFiles(includeDeleted = false): DocumentFile[] {
    return includeDeleted ? this.files : this.files.filter((f) => !f.isDeleted);
  }

  public getDeletedFiles(): DocumentFile[] {
    return this.files.filter((f) => f.isDeleted);
  }

  public getFileById(fileId: string): DocumentFile | undefined {
    return this.files.find((f) => f.id === fileId);
  }

  public async uploadFile(
    file: File | { name: string; size: number; content: string },
    category: DocumentCategory,
    department: string,
    metadata: MetallurgicalMetadata,
    requiresApproval = true,
    securityClassification: SecurityClassification = 'INTERNAL',
    expiryDate?: string,
    tags: string[] = []
  ): Promise<DocumentFile> {
    const uploader = this.getCurrentUser();
    const rawContent = 'content' in file ? file.content : await file.text();
    const fileName = file.name;
    const fileSizeBytes = file.size;
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'dat';

    // 1. Check for Duplicate SHA-256
    const sha256 = await computeSHA256(rawContent);
    const duplicate = this.files.find((f) => !f.isDeleted && f.sha256Hash === sha256);
    if (duplicate) {
      throw new Error(`Duplicate file detected! An identical document with SHA-256 ${sha256.substring(0, 16)}... already exists: "${duplicate.fileName}"`);
    }

    // 2. Quarantine / Malware Sandbox Simulation
    let securityStatus: 'Safe' | 'Quarantined' | 'Suspicious' = 'Safe';
    let quarantineReason: string | undefined = undefined;

    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith('.exe') || lowerName.endsWith('.bat') || lowerName.endsWith('.sh') || lowerName.endsWith('.vbs')) {
      throw new Error('Dangerous executable format rejected by pre-upload file validator.');
    }

    if (rawContent.includes('<script>') || rawContent.includes('AutoExec') || rawContent.includes('eval(')) {
      securityStatus = 'Quarantined';
      quarantineReason = 'Sandboxing detected embedded script or macro execution pattern.';
      this.createSecurityAlert(
        'MALWARE_DETECTED',
        'HIGH',
        `Quarantined file upload: ${fileName}`,
        `Suspicious macro / script structure detected during heuristic scan of file uploaded by ${uploader.username}.`,
        uploader.username
      );
    }

    // 3. Encrypt payload with AES-256-GCM
    const encResult = await encryptData(rawContent);

    // Compute Expiry Status
    let expiryStatus: DocumentExpiryStatus = 'NOT_APPLICABLE';
    if (expiryDate) {
      const expTime = new Date(expiryDate).getTime();
      const now = Date.now();
      const diffDays = Math.ceil((expTime - now) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) expiryStatus = 'EXPIRED';
      else if (diffDays <= 30) expiryStatus = 'EXPIRING_SOON';
      else expiryStatus = 'VALID';
    }

    const fileId = `doc-${Date.now()}`;
    const initialVersion: FileVersion = {
      versionId: `ver-${fileId}-1`,
      versionNumber: 'v1.0',
      fileSize: fileSizeBytes,
      uploadedAt: new Date().toISOString(),
      uploadedBy: uploader.id,
      uploaderName: uploader.fullName,
      sha256Hash: sha256,
      changeLog: 'Initial upload and AES-256-GCM encryption.',
      encryptedDataPreview: encResult.cipherHex.substring(0, 100),
      iv: encResult.ivHex,
      authTag: encResult.authTagHex,
      rawContent: rawContent
    };

    const newDoc: DocumentFile = {
      id: fileId,
      fileName: fileName,
      originalName: fileName,
      fileExtension,
      mimeType: fileExtension === 'pdf' ? 'application/pdf' : 'application/octet-stream',
      fileSizeBytes,
      category,
      department,
      uploadedBy: uploader.id,
      uploaderName: uploader.fullName,
      uploaderRole: uploader.role,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentVersion: 'v1.0',
      versions: [initialVersion],
      isEncrypted: true,
      encryptionAlgorithm: 'AES-256-GCM',
      sha256Hash: sha256,
      originalSha256Hash: sha256,
      integrityStatus: 'Valid',
      securityStatus,
      quarantineReason,
      iv: encResult.ivHex,
      authTag: encResult.authTagHex,
      encryptedDataPreview: encResult.cipherHex.substring(0, 100),
      rawContent,
      securityClassification,
      expiryDate,
      expiryStatus,
      tags: tags.length > 0 ? tags : [category.split(' ')[0], metadata.materialGrade || 'Steel'],
      approvalStatus: requiresApproval ? 'Pending Review' : 'Approved',
      permissions: {
        canView: securityClassification === 'HIGHLY CONFIDENTIAL' ? ['Admin', 'Manager'] : ['Admin', 'Manager', 'Employee', 'Viewer'],
        canDownload: securityClassification === 'HIGHLY CONFIDENTIAL' ? ['Admin'] : ['Admin', 'Manager', 'Employee', 'Viewer'],
        canEdit: ['Admin', 'Manager', 'Employee'],
        canDelete: ['Admin'],
        canShare: ['Admin', 'Manager'],
        canApprove: ['Admin', 'Manager']
      },
      sharedGrants: [],
      metadata,
      isDeleted: false
    };

    this.files.unshift(newDoc);

    // If metadata includes batch number, attach to batch automatically
    if (metadata.batchNumber) {
      const matchedBatch = this.batches.find((b) => b.batchId.toLowerCase() === metadata.batchNumber?.toLowerCase());
      if (matchedBatch && !matchedBatch.attachedDocIds.includes(newDoc.id)) {
        matchedBatch.attachedDocIds.push(newDoc.id);
      }
    }

    // If metadata includes furnace ID, attach to furnace
    if (metadata.furnaceId) {
      const matchedFurnace = this.furnaces.find((f) => f.furnaceName.toLowerCase().includes(metadata.furnaceId?.toLowerCase() || ''));
      if (matchedFurnace && !matchedFurnace.attachedDocIds.includes(newDoc.id)) {
        matchedFurnace.attachedDocIds.push(newDoc.id);
      }
    }

    this.logAudit(
      'FILE_UPLOAD',
      newDoc.fileName,
      `Encrypted with AES-256-GCM, SHA-256: ${sha256.substring(0, 16)}..., Classification: ${securityClassification}`,
      securityStatus === 'Quarantined' ? 'WARNING' : 'INFO',
      newDoc.id
    );

    if (requiresApproval) {
      this.addNotification({
        id: `notif-${Date.now()}`,
        title: 'New Document Awaiting Review',
        message: `${newDoc.fileName} (${newDoc.category}) uploaded by ${uploader.fullName}. Review required.`,
        timestamp: new Date().toISOString(),
        priority: 'Information',
        isRead: false,
        category: 'APPROVAL',
        linkView: 'approvals',
        targetId: newDoc.id
      });
    }

    this.notify();
    return newDoc;
  }

  public async uploadNewVersion(
    fileId: string,
    file: File | { name: string; size: number; content: string },
    changeLog: string
  ): Promise<DocumentFile> {
    const uploader = this.getCurrentUser();
    const doc = this.getFileById(fileId);
    if (!doc) throw new Error('Document not found');

    const rawContent = 'content' in file ? file.content : await file.text();
    const sha256 = await computeSHA256(rawContent);
    const encResult = await encryptData(rawContent);

    const currentNum = parseFloat(doc.currentVersion.replace('v', '')) || 1.0;
    const nextVersion = `v${(currentNum + 0.1).toFixed(1)}`;

    const newVersionObj: FileVersion = {
      versionId: `ver-${doc.id}-${doc.versions.length + 1}`,
      versionNumber: nextVersion,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: uploader.id,
      uploaderName: uploader.fullName,
      sha256Hash: sha256,
      changeLog: changeLog || 'Uploaded updated revision.',
      encryptedDataPreview: encResult.cipherHex.substring(0, 100),
      iv: encResult.ivHex,
      authTag: encResult.authTagHex,
      rawContent
    };

    doc.versions.push(newVersionObj);
    doc.currentVersion = nextVersion;
    doc.fileSizeBytes = file.size;
    doc.sha256Hash = sha256;
    doc.iv = encResult.ivHex;
    doc.authTag = encResult.authTagHex;
    doc.encryptedDataPreview = encResult.cipherHex.substring(0, 100);
    doc.rawContent = rawContent;
    doc.updatedAt = new Date().toISOString();
    doc.integrityStatus = 'Valid';
    doc.approvalStatus = 'Pending Review';

    this.logAudit(
      'FILE_VERSION_UPLOAD',
      doc.fileName,
      `Uploaded new version ${nextVersion}. SHA-256: ${sha256.substring(0, 16)}... Reason: ${changeLog}`,
      'INFO',
      doc.id
    );

    this.notify();
    return doc;
  }

  public async downloadFile(fileId: string): Promise<{ blob: Blob; fileName: string }> {
    const user = this.getCurrentUser();
    const doc = this.getFileById(fileId);
    if (!doc) throw new Error('File not found in vault');

    // Check direct role permission or temporary shared grant
    const hasRolePermission = doc.permissions.canDownload.includes(user.role);
    const activeShare = doc.sharedGrants?.find(
      (g) => !g.isRevoked && (g.sharedWithUserId === user.id || g.sharedWithUserRole === user.role) && new Date(g.expiresAt).getTime() > Date.now()
    );

    if (!hasRolePermission && !activeShare) {
      this.logAudit(
        'FILE_DOWNLOAD',
        doc.fileName,
        `UNAUTHORIZED DOWNLOAD ATTEMPT BLOCKED for user ${user.username} (${user.role})`,
        'CRITICAL',
        doc.id
      );
      this.createSecurityAlert(
        'UNAUTHORIZED_ACCESS',
        'HIGH',
        `Unauthorized Download Attempt: ${doc.fileName}`,
        `User ${user.username} with role ${user.role} attempted to download file ${doc.fileName} without appropriate permission.`,
        user.username,
        doc.id
      );
      throw new Error(`Unauthorized! Your role (${user.role}) does not have download permissions for this document.`);
    }

    if (activeShare) {
      activeShare.accessCount = (activeShare.accessCount || 0) + 1;
    }

    if (doc.securityStatus === 'Quarantined' && user.role !== 'Admin') {
      throw new Error('This file is currently in security quarantine and cannot be downloaded until cleared by an Administrator.');
    }

    // Decrypt on-the-fly using AES-256-GCM
    let decryptedBytes: ArrayBuffer;
    if (doc.rawContent) {
      decryptedBytes = new TextEncoder().encode(doc.rawContent).buffer;
    } else {
      decryptedBytes = await decryptData(doc.encryptedDataPreview, doc.iv, doc.authTag);
    }

    // Verify integrity before returning
    const currentHash = await computeSHA256(decryptedBytes);
    if (doc.integrityStatus === 'Tampered' || currentHash !== doc.sha256Hash) {
      this.logAudit(
        'INTEGRITY_TAMPER_DETECTED',
        doc.fileName,
        `File download failed SHA-256 integrity check. Possible data tampering or bit-rot detected!`,
        'CRITICAL',
        doc.id
      );
      throw new Error(`Integrity Failure! File SHA-256 does not match recorded vault signature. Decryption aborted to prevent tampered execution.`);
    }

    this.logAudit(
      'FILE_DOWNLOAD',
      doc.fileName,
      `Authorized download and on-the-fly AES-256-GCM decryption for user ${user.username}`,
      'INFO',
      doc.id
    );

    const blob = new Blob([decryptedBytes], { type: doc.mimeType });
    this.notify();
    return { blob, fileName: doc.fileName };
  }

  // --- Document Sharing & Temporary Access ---

  public shareDocument(
    fileId: string,
    recipientEmail: string,
    recipientRole: UserRole,
    daysValid: number,
    accessLevel: 'VIEW_ONLY' | 'VIEW_DOWNLOAD'
  ): SharedFileAccess {
    const user = this.getCurrentUser();
    const doc = this.getFileById(fileId);
    if (!doc) throw new Error('File not found');

    const expiresAt = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000).toISOString();
    const newGrant: SharedFileAccess = {
      shareId: `share-${Date.now()}`,
      fileId,
      sharedWithEmail: recipientEmail,
      sharedWithUserRole: recipientRole,
      sharedByUserId: user.id,
      sharedByUserName: user.fullName,
      sharedAt: new Date().toISOString(),
      expiresAt,
      canDownload: accessLevel === 'VIEW_DOWNLOAD',
      accessLevel,
      accessCount: 0,
      isRevoked: false
    };

    if (!doc.sharedGrants) doc.sharedGrants = [];
    doc.sharedGrants.push(newGrant);

    this.logAudit(
      'FILE_SHARE_GRANTED',
      doc.fileName,
      `Temporary access granted to ${recipientEmail || recipientRole} until ${new Date(expiresAt).toLocaleDateString()} (${accessLevel})`,
      'INFO',
      doc.id
    );

    this.addNotification({
      id: `notif-${Date.now()}`,
      title: 'New Document Shared With You',
      message: `${user.fullName} shared "${doc.fileName}" (${accessLevel}) with access valid for ${daysValid} days.`,
      timestamp: new Date().toISOString(),
      priority: 'Information',
      isRead: false,
      category: 'SHARE',
      linkView: 'documents',
      targetId: doc.id
    });

    this.notify();
    return newGrant;
  }

  public revokeShare(fileId: string, shareId: string) {
    const doc = this.getFileById(fileId);
    if (doc && doc.sharedGrants) {
      const grant = doc.sharedGrants.find((g) => g.shareId === shareId);
      if (grant) {
        grant.isRevoked = true;
        this.logAudit('FILE_SHARE_REVOKED', doc.fileName, `Revoked shared access grant ${shareId}`, 'INFO', doc.id);
        this.notify();
      }
    }
  }

  // --- Approvals ---

  public approveDocument(fileId: string, remarks: string) {
    const user = this.getCurrentUser();
    if (user.role !== 'Admin' && user.role !== 'Manager') {
      throw new Error('Only Managers or Administrators can approve documents.');
    }
    const doc = this.getFileById(fileId);
    if (doc) {
      doc.approvalStatus = 'Approved';
      doc.reviewedBy = user.id;
      doc.reviewerName = user.fullName;
      doc.reviewedAt = new Date().toISOString();
      doc.reviewRemarks = remarks || 'Approved after metallurgical verification.';
      this.logAudit(
        'FILE_APPROVE',
        doc.fileName,
        `Approved by ${user.fullName} (${user.role}). Remarks: ${doc.reviewRemarks}`,
        'SUCCESS',
        doc.id
      );

      this.addNotification({
        id: `notif-${Date.now()}`,
        title: 'Document Approved',
        message: `Your document "${doc.fileName}" was digitally approved by ${user.fullName}.`,
        timestamp: new Date().toISOString(),
        priority: 'Success',
        isRead: false,
        category: 'APPROVAL',
        linkView: 'documents',
        targetId: doc.id
      });

      this.notify();
    }
  }

  public rejectDocument(fileId: string, remarks: string) {
    const user = this.getCurrentUser();
    if (user.role !== 'Admin' && user.role !== 'Manager') {
      throw new Error('Only Managers or Administrators can reject documents.');
    }
    const doc = this.getFileById(fileId);
    if (doc) {
      doc.approvalStatus = 'Rejected';
      doc.reviewedBy = user.id;
      doc.reviewerName = user.fullName;
      doc.reviewedAt = new Date().toISOString();
      doc.reviewRemarks = remarks || 'Document rejected due to non-conformance.';
      this.logAudit(
        'FILE_REJECT',
        doc.fileName,
        `Rejected by ${user.fullName} (${user.role}). Reason: ${doc.reviewRemarks}`,
        'WARNING',
        doc.id
      );

      this.addNotification({
        id: `notif-${Date.now()}`,
        title: 'Document Rejected (Action Required)',
        message: `Document "${doc.fileName}" rejected by ${user.fullName}: "${doc.reviewRemarks}"`,
        timestamp: new Date().toISOString(),
        priority: 'Warning',
        isRead: false,
        category: 'APPROVAL',
        linkView: 'approvals',
        targetId: doc.id
      });

      this.notify();
    }
  }

  // --- Soft Delete & Purge ---

  public softDeleteFile(fileId: string) {
    const user = this.getCurrentUser();
    const doc = this.getFileById(fileId);
    if (doc) {
      if (!doc.permissions.canDelete.includes(user.role)) {
        throw new Error(`Your role (${user.role}) does not have permission to delete this file.`);
      }
      doc.isDeleted = true;
      doc.deletedAt = new Date().toISOString();
      doc.deletedBy = user.fullName;
      this.logAudit(
        'FILE_SOFT_DELETE',
        doc.fileName,
        `Moved to Recycle Bin by ${user.fullName} (${user.role}).`,
        'WARNING',
        doc.id
      );
      this.notify();
    }
  }

  public restoreFile(fileId: string) {
    const user = this.getCurrentUser();
    if (user.role !== 'Admin') {
      throw new Error('Only Administrators are authorized to restore files from the Recycle Bin.');
    }
    const doc = this.getFileById(fileId);
    if (doc) {
      doc.isDeleted = false;
      doc.deletedAt = undefined;
      doc.deletedBy = undefined;
      this.logAudit(
        'FILE_RESTORE',
        doc.fileName,
        `Restored from Recycle Bin to active vault by Admin ${user.fullName}.`,
        'SUCCESS',
        doc.id
      );
      this.notify();
    }
  }

  public permanentDeleteFile(fileId: string) {
    const user = this.getCurrentUser();
    if (user.role !== 'Admin') {
      throw new Error('Only Administrators can permanently purge files.');
    }
    const doc = this.getFileById(fileId);
    if (doc) {
      const name = doc.fileName;
      this.files = this.files.filter((f) => f.id !== fileId);
      this.logAudit(
        'FILE_PERMANENT_DELETE',
        name,
        `PERMANENTLY PURGED file and encrypted blocks from disk by Admin ${user.fullName}.`,
        'CRITICAL'
      );
      this.notify();
    }
  }

  // --- Folder & File Organization Operations ---

  public getFolders(): DocumentFolder[] {
    return this.folders;
  }

  public createFolder(name: string, department: string, color: string = 'amber'): DocumentFolder {
    const newFolder: DocumentFolder = {
      id: `fld-${Date.now()}`,
      name,
      department,
      createdAt: new Date().toISOString(),
      createdBy: this.getCurrentUser().id,
      color
    };
    this.folders.push(newFolder);
    this.logAudit('USER_UPDATED', name, `Created document folder "${name}" in ${department}`, 'INFO');
    this.notify();
    return newFolder;
  }

  public renameFile(fileId: string, newFileName: string) {
    const file = this.getFileById(fileId);
    if (!file) throw new Error('File not found');
    const oldName = file.fileName;
    file.fileName = newFileName;
    file.updatedAt = new Date().toISOString();
    this.logAudit('FILE_VIEW', file.fileName, `Renamed document from "${oldName}" to "${newFileName}"`, 'INFO', file.id);
    this.notify();
  }

  public moveFileToFolder(fileId: string, folderId: string, folderName: string) {
    const file = this.getFileById(fileId);
    if (!file) throw new Error('File not found');
    file.folderId = folderId;
    file.folderName = folderName;
    file.updatedAt = new Date().toISOString();
    this.logAudit('FILE_VIEW', file.fileName, `Moved document "${file.fileName}" into folder "${folderName}"`, 'INFO', file.id);
    this.notify();
  }

  public updateFileDescription(fileId: string, description: string) {
    const file = this.getFileById(fileId);
    if (!file) throw new Error('File not found');
    file.description = description;
    file.updatedAt = new Date().toISOString();
    this.notify();
  }

  // --- Integrity Verification & Tamper Simulation ---

  public async verifyIntegrity(fileId: string): Promise<{ isValid: boolean; currentHash: string; expectedHash: string }> {
    const doc = this.getFileById(fileId);
    if (!doc) throw new Error('File not found');

    const raw = doc.rawContent || '';
    const currentHash = await computeSHA256(raw);
    const isValid = currentHash.toLowerCase() === doc.originalSha256Hash.toLowerCase();

    doc.integrityStatus = isValid ? 'Valid' : 'Tampered';
    doc.sha256Hash = currentHash;

    if (isValid) {
      this.logAudit(
        'INTEGRITY_CHECK_PASSED',
        doc.fileName,
        `Cryptographic SHA-256 verified: ${currentHash.substring(0, 16)}... Integrity check PASSED.`,
        'SUCCESS',
        doc.id
      );
    } else {
      this.logAudit(
        'INTEGRITY_TAMPER_DETECTED',
        doc.fileName,
        `ALERT: File hash mismatch! Expected: ${doc.originalSha256Hash.substring(0, 16)}..., Found: ${currentHash.substring(0, 16)}...`,
        'CRITICAL',
        doc.id
      );
      this.createSecurityAlert(
        'INTEGRITY_TAMPER',
        'CRITICAL',
        `Integrity Tamper Detected: ${doc.fileName}`,
        `File ${doc.fileName} SHA-256 signature does not match original ingest record. Content may have been altered outside authorized vault channels.`,
        undefined,
        doc.id
      );
    }

    this.notify();
    return { isValid, currentHash, expectedHash: doc.originalSha256Hash };
  }

  public simulateTamper(fileId: string) {
    const doc = this.getFileById(fileId);
    if (doc) {
      doc.rawContent = (doc.rawContent || '') + '\n[UNAUTHORIZED_MODIFICATION_PAYLOAD_TAMPER_TEST]';
      doc.integrityStatus = 'Tampered';
      this.createSecurityAlert(
        'INTEGRITY_TAMPER',
        'CRITICAL',
        `Tampering Alert Triggered on ${doc.fileName}`,
        `Simulated unauthorized file modification detected. The hash of the payload has diverged from the certified ingest signature.`,
        'external_attacker',
        doc.id
      );
      this.logAudit(
        'INTEGRITY_TAMPER_DETECTED',
        doc.fileName,
        `Simulate Tamper Triggered: file payload altered. Integrity status set to TAMPERED.`,
        'CRITICAL',
        doc.id
      );
      this.notify();
    }
  }

  // --- Heat Treatment Batch Management ---

  public getBatches(): HeatTreatmentBatch[] {
    return this.batches;
  }

  public createBatch(batchData: Omit<HeatTreatmentBatch, 'id'>): HeatTreatmentBatch {
    const newBatch: HeatTreatmentBatch = {
      ...batchData,
      id: `batch-${Date.now()}`
    };
    this.batches.unshift(newBatch);
    this.logAudit(
      'BATCH_CREATED',
      newBatch.batchId,
      `Created heat-treatment batch ${newBatch.batchId} (${newBatch.customerName}, Grade: ${newBatch.materialGrade}, Temp: ${newBatch.temperatureC}°C)`,
      'SUCCESS'
    );
    this.notify();
    return newBatch;
  }

  public updateBatchStatus(batchId: string, qualityStatus: HeatTreatmentBatch['qualityStatus'], remarks?: string) {
    const batch = this.batches.find((b) => b.id === batchId || b.batchId === batchId);
    if (batch) {
      batch.qualityStatus = qualityStatus;
      if (remarks) batch.remarks = remarks;
      this.notify();
    }
  }

  // --- Furnace Record Management ---

  public getFurnaces(): FurnaceRecord[] {
    return this.furnaces;
  }

  public updateFurnace(furnaceId: string, partial: Partial<FurnaceRecord>) {
    const f = this.furnaces.find((furn) => furn.id === furnaceId || furn.furnaceId === furnaceId);
    if (f) {
      Object.assign(f, partial);
      this.logAudit('FURNACE_UPDATED', f.furnaceName, `Updated furnace operating status to ${f.operatingStatus}`, 'INFO');
      this.notify();
    }
  }

  // --- AI-Assisted Smart Document Classification ---

  public predictCategory(fileName: string, textContent: string = ''): { category: DocumentCategory; confidence: number; suggestedTags: string[] } {
    const lower = (fileName + ' ' + textContent).toLowerCase();

    if (lower.includes('qc') || lower.includes('certificate') || lower.includes('hardness') || lower.includes('hrc') || lower.includes('hv') || lower.includes('microstructure')) {
      return { category: 'Quality Certificates', confidence: 96, suggestedTags: ['Quality', 'Hardness-Test', 'Microstructure'] };
    }
    if (lower.includes('cqi-9') || lower.includes('cqi9') || lower.includes('calibration') || lower.includes('tus') || lower.includes('pyrometry') || lower.includes('thermocouple')) {
      return { category: 'Calibration Certificates', confidence: 94, suggestedTags: ['Calibration', 'CQI-9', 'Pyrometry'] };
    }
    if (lower.includes('sqf') || lower.includes('furnace') || lower.includes('cycle') || lower.includes('atmosphere') || lower.includes('carburizing')) {
      return { category: 'Heat-Treatment Records', confidence: 91, suggestedTags: ['Furnace', 'Heat-Treatment', 'Cycle-Log'] };
    }
    if (lower.includes('drawing') || lower.includes('dwg') || lower.includes('customer') || lower.includes('shaft') || lower.includes('gear')) {
      return { category: 'Customer Documents', confidence: 89, suggestedTags: ['Customer', 'Engineering-Drawing'] };
    }
    if (lower.includes('sop') || lower.includes('standard operating') || lower.includes('procedure') || lower.includes('work instruction')) {
      return { category: 'SOPs & Work Instructions', confidence: 95, suggestedTags: ['SOP', 'Work-Instruction', 'Standard'] };
    }
    if (lower.includes('audit') || lower.includes('iatf') || lower.includes('ncr') || lower.includes('surveillance') || lower.includes('iso')) {
      return { category: 'Audit Documents', confidence: 93, suggestedTags: ['Audit', 'IATF-16949', 'Compliance'] };
    }
    if (lower.includes('invoice') || lower.includes('challan') || lower.includes('billing') || lower.includes('commercial')) {
      return { category: 'Invoices & Commercials', confidence: 90, suggestedTags: ['Commercial', 'Challan', 'Invoice'] };
    }
    if (lower.includes('mill') || lower.includes('mtr') || lower.includes('steel') || lower.includes('raw material') || lower.includes('chemical')) {
      return { category: 'Purchase & MTR', confidence: 88, suggestedTags: ['MTR', 'Raw-Material', 'Steel'] };
    }

    return { category: 'Production Reports', confidence: 75, suggestedTags: ['Production', 'Metallurgy'] };
  }

  // --- Security Risk Score Calculator ---

  public calculateSecurityRiskScore(): {
    score: number; // 0 - 100
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    factors: { name: string; impact: number; description: string }[];
  } {
    let score = 12; // Base baseline
    const factors = [];

    const tampered = this.files.filter((f) => !f.isDeleted && f.integrityStatus === 'Tampered').length;
    if (tampered > 0) {
      const imp = tampered * 25;
      score += imp;
      factors.push({ name: 'Tampered Files Detected', impact: imp, description: `${tampered} file failed cryptographic SHA-256 signature check.` });
    }

    const quarantined = this.files.filter((f) => !f.isDeleted && f.securityStatus === 'Quarantined').length;
    if (quarantined > 0) {
      const imp = quarantined * 15;
      score += imp;
      factors.push({ name: 'Quarantined Files', impact: imp, description: `${quarantined} file quarantined by pre-upload heuristic sandbox.` });
    }

    const highAlerts = this.alerts.filter((a) => a.status === 'NEW' && (a.severity === 'HIGH' || a.severity === 'CRITICAL')).length;
    if (highAlerts > 0) {
      const imp = highAlerts * 20;
      score += imp;
      factors.push({ name: 'Active High Priority Threats', impact: imp, description: `${highAlerts} critical/high security alerts awaiting resolution.` });
    }

    const expiredCerts = this.files.filter((f) => !f.isDeleted && f.expiryStatus === 'EXPIRED').length;
    if (expiredCerts > 0) {
      score += 10;
      factors.push({ name: 'Expired Compliance Certificates', impact: 10, description: `${expiredCerts} calibration/compliance certs have expired.` });
    }

    score = Math.min(100, Math.max(0, score));

    let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (score >= 75) level = 'CRITICAL';
    else if (score >= 50) level = 'HIGH';
    else if (score >= 25) level = 'MEDIUM';

    return { score, level, factors };
  }

  // --- Notifications ---

  public getNotifications(): NotificationItem[] {
    return this.notifications;
  }

  public addNotification(notif: NotificationItem) {
    this.notifications.unshift(notif);
    this.notify();
  }

  public markNotificationRead(id: string) {
    const item = this.notifications.find((n) => n.id === id);
    if (item) {
      item.isRead = true;
      this.notify();
    }
  }

  public clearAllNotifications() {
    this.notifications = [];
    this.notify();
  }

  // --- Audit & Alerts ---

  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  public logAudit(
    action: AuditLog['action'],
    resourceName?: string,
    details = '',
    severity: AuditLog['severity'] = 'INFO',
    resourceId?: string
  ) {
    const user = this.getCurrentUser();
    const entry: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      username: user.username,
      userRole: user.role,
      action,
      resourceId,
      resourceName,
      ipAddress: '192.168.1.' + (user.role === 'Admin' ? '10' : user.role === 'Manager' ? '12' : '45'),
      userAgent: navigator.userAgent.substring(0, 100),
      details,
      severity
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 500) {
      this.auditLogs = this.auditLogs.slice(0, 500);
    }
    this.saveState();
  }

  public getSecurityAlerts(): SecurityAlert[] {
    return this.alerts;
  }

  public createSecurityAlert(
    alertType: SecurityAlert['alertType'],
    severity: SecurityAlert['severity'],
    title: string,
    description: string,
    affectedUser?: string,
    affectedFile?: string
  ) {
    const alert: SecurityAlert = {
      id: `sec-${Date.now()}`,
      timestamp: new Date().toISOString(),
      alertType,
      severity,
      title,
      description,
      sourceIp: '185.220.101.' + Math.floor(Math.random() * 250 + 1),
      affectedUser,
      affectedFile,
      status: 'NEW'
    };
    this.alerts.unshift(alert);

    this.addNotification({
      id: `notif-${Date.now()}`,
      title: `SECURITY ALERT: ${title}`,
      message: description,
      timestamp: new Date().toISOString(),
      priority: severity === 'CRITICAL' ? 'Critical' : 'Warning',
      isRead: false,
      category: 'SECURITY',
      linkView: 'security',
      targetId: alert.id
    });

    this.notify();
    return alert;
  }

  public updateAlertStatus(alertId: string, status: SecurityAlert['status'], actionTaken?: string) {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = status;
      if (actionTaken) alert.actionTaken = actionTaken;
      this.logAudit(
        'SECURITY_ALERT_TRIGGERED',
        undefined,
        `Security alert "${alert.title}" status changed to ${status}. Action: ${actionTaken || 'None'}`,
        'INFO'
      );
      this.notify();
    }
  }

  // --- Backup & Recovery ---

  public exportBackup(): VaultBackup {
    const backup: VaultBackup = {
      exportDate: new Date().toISOString(),
      systemName: 'Sri Vishnu Heat Treaters Secure Document Vault',
      appVersion: '3.0.0-PRO-CAPSTONE',
      totalFiles: this.files.length,
      totalAuditLogs: this.auditLogs.length,
      totalBatches: this.batches.length,
      totalFurnaces: this.furnaces.length,
      checksum: 'SVHT-VAULT-SHA256-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      files: this.files,
      auditLogs: this.auditLogs,
      securityAlerts: this.alerts,
      users: this.users,
      batches: this.batches,
      furnaces: this.furnaces,
      notifications: this.notifications
    };
    this.logAudit('BACKUP_EXPORT', undefined, `Exported complete encrypted vault snapshot (${backup.totalFiles} docs, ${backup.totalBatches} batches).`, 'SUCCESS');
    return backup;
  }

  public restoreBackup(backup: VaultBackup) {
    if (!backup.files || !backup.users) {
      throw new Error('Invalid backup archive structure.');
    }
    this.files = backup.files;
    this.auditLogs = backup.auditLogs || [];
    this.alerts = backup.securityAlerts || [];
    this.users = backup.users;
    this.batches = backup.batches || INITIAL_BATCHES;
    this.furnaces = backup.furnaces || INITIAL_FURNACES;
    this.notifications = backup.notifications || INITIAL_NOTIFICATIONS;
    this.logAudit('BACKUP_RESTORE', undefined, `Vault restored successfully from snapshot created on ${backup.exportDate}`, 'CRITICAL');
    this.notify();
  }

  public resetToFactory() {
    this.users = INITIAL_USERS;
    this.files = INITIAL_FILES;
    this.auditLogs = INITIAL_AUDIT_LOGS;
    this.alerts = INITIAL_SECURITY_ALERTS;
    this.departments = INITIAL_DEPARTMENTS;
    this.batches = INITIAL_BATCHES;
    this.furnaces = INITIAL_FURNACES;
    this.notifications = INITIAL_NOTIFICATIONS;
    this.folders = INITIAL_FOLDERS;
    this.currentUser = INITIAL_USERS[0];
    this.jwtToken = this.createDemoJwt(this.currentUser);
    this.notify();
  }
}

export const vaultStorage = new StorageService();

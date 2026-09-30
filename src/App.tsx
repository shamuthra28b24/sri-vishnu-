/**
 * Sri Vishnu Heat Treaters - Secure File Storage Management System
 * Capstone Project: Information Security & Enterprise Metallurgical Data Vault
 */

import React, { useState, useEffect } from 'react';
import { vaultStorage } from './services/storageService';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { DocumentsView } from './components/DocumentsView';
import { UploadModal } from './components/UploadModal';
import { UploadVersionModal } from './components/UploadVersionModal';
import { FileDetailsModal } from './components/FileDetailsModal';
import { ApprovalsView } from './components/ApprovalsView';
import { SecurityCenterView } from './components/SecurityCenterView';
import { IntegrityCheckerView } from './components/IntegrityCheckerView';
import { AuditLogsView } from './components/AuditLogsView';
import { UsersManagementView } from './components/UsersManagementView';
import { AnalyticsReportsView } from './components/AnalyticsReportsView';
import { RecycleBinView } from './components/RecycleBinView';
import { CategoriesView } from './components/CategoriesView';
import { BackupRecoveryView } from './components/BackupRecoveryView';
import { CapstoneDocsView } from './components/CapstoneDocsView';
import { BatchesView } from './components/BatchesView';
import { FurnacesView } from './components/FurnacesView';
import { QualityView } from './components/QualityView';
import { ShareFileModal } from './components/ShareFileModal';
import { NotificationsModal } from './components/NotificationsModal';
import { LoginPortal } from './components/LoginPortal';
import { ProfileView } from './components/ProfileView';
import { CustomerDocsView } from './components/CustomerDocsView';
import { MaintenanceView } from './components/MaintenanceView';
import { DocControlView } from './components/DocControlView';
import { SecureSharingView } from './components/SecureSharingView';
import { SettingsView } from './components/SettingsView';
import { FilePreviewModal } from './components/FilePreviewModal';
import {
  DocumentFile,
  DocumentCategory,
  MetallurgicalMetadata,
  UserRole,
  SecurityClassification,
  HeatTreatmentBatch,
  FurnaceRecord
} from './types';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function App() {
  const [, setTick] = useState(0);

  // Subscribe to storage updates
  useEffect(() => {
    return vaultStorage.subscribe(() => {
      setTick((t) => t + 1);
    });
  }, []);

  const currentUser = vaultStorage.getCurrentUser();
  const allFiles = vaultStorage.getFiles(true);
  const activeFiles = vaultStorage.getFiles(false);
  const deletedFiles = vaultStorage.getDeletedFiles();
  const users = vaultStorage.getUsers();
  const alerts = vaultStorage.getSecurityAlerts();
  const auditLogs = vaultStorage.getAuditLogs();
  const batches = vaultStorage.getBatches();
  const furnaces = vaultStorage.getFurnaces();
  const notifications = vaultStorage.getNotifications();

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [fileToShare, setFileToShare] = useState<DocumentFile | null>(null);
  const [fileToVersion, setFileToVersion] = useState<DocumentFile | null>(null);
  const [selectedFileForDetails, setSelectedFileForDetails] = useState<DocumentFile | null>(null);
  const [fileToPreview, setFileToPreview] = useState<DocumentFile | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handlers
  const handleUploadNewFile = async (
    file: { name: string; size: number; content: string },
    category: DocumentCategory,
    department: string,
    metadata: MetallurgicalMetadata,
    requiresApproval: boolean,
    securityClassification: SecurityClassification,
    expiryDate?: string,
    tags?: string[]
  ) => {
    try {
      const newDoc = await vaultStorage.uploadFile(
        file,
        category,
        department,
        metadata,
        requiresApproval,
        securityClassification,
        expiryDate,
        tags
      );
      showToast(`File "${newDoc.fileName}" encrypted with AES-256-GCM and stored successfully!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Upload failed', 'error');
      throw err;
    }
  };

  const handleUploadVersion = async (
    fileId: string,
    file: { name: string; size: number; content: string },
    changeLog: string
  ) => {
    try {
      const updatedDoc = await vaultStorage.uploadNewVersion(fileId, file, changeLog);
      showToast(`New version ${updatedDoc.currentVersion} released for "${updatedDoc.fileName}"!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Version upload failed', 'error');
      throw err;
    }
  };

  const handleDownloadFile = async (file: DocumentFile) => {
    try {
      const { blob, fileName } = await vaultStorage.downloadFile(file.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Decrypted and downloaded "${fileName}" successfully.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Download failed', 'error');
    }
  };

  const handleShareFile = (
    fileId: string,
    recipientEmail: string,
    recipientRole: UserRole,
    daysValid: number,
    accessLevel: 'VIEW_ONLY' | 'VIEW_DOWNLOAD'
  ) => {
    try {
      vaultStorage.shareDocument(fileId, recipientEmail, recipientRole, daysValid, accessLevel);
      showToast(`Temporary access granted to ${recipientEmail || recipientRole} for ${daysValid} days.`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleVerifyIntegrity = async (fileId: string) => {
    try {
      const res = await vaultStorage.verifyIntegrity(fileId);
      if (res.isValid) {
        showToast('SHA-256 Checksum Verified: 100% Match with Certified Signature.', 'success');
      } else {
        showToast('INTEGRITY ALERT: SHA-256 mismatch detected! Content was tampered with.', 'error');
      }
      return res;
    } catch (err: any) {
      showToast(err.message || 'Integrity check failed', 'error');
      throw err;
    }
  };

  const handleSimulateTamper = (fileId: string) => {
    vaultStorage.simulateTamper(fileId);
    showToast('Tampering simulated: file payload altered! Immediate security alert triggered.', 'warning');
  };

  const handleApproveDocument = (fileId: string, remarks: string) => {
    try {
      vaultStorage.approveDocument(fileId, remarks);
      showToast('Document digitally approved and released for audit presentation.', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRejectDocument = (fileId: string, remarks: string) => {
    try {
      vaultStorage.rejectDocument(fileId, remarks);
      showToast('Document rejected and returned to uploader for correction.', 'warning');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSoftDelete = (fileId: string) => {
    try {
      vaultStorage.softDeleteFile(fileId);
      showToast('Document moved to Recycle Bin.', 'warning');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRestoreFile = (fileId: string) => {
    try {
      vaultStorage.restoreFile(fileId);
      showToast('Document restored from Recycle Bin.', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handlePermanentDelete = (fileId: string) => {
    try {
      vaultStorage.permanentDeleteFile(fileId);
      showToast('Document permanently destroyed and purged from storage.', 'error');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateAlertStatus = (alertId: string, status: any, actionTaken?: string) => {
    vaultStorage.updateAlertStatus(alertId, status, actionTaken);
    showToast(`Security incident status updated to ${status}.`, 'success');
  };

  const handleTriggerSimulatedAlert = (type: 'failed_logins' | 'unauthorized_download' | 'tamper') => {
    if (type === 'failed_logins') {
      vaultStorage.createSecurityAlert(
        'FAILED_LOGINS',
        'HIGH',
        'Brute Force Attack Detected: Multiple Failed SSH/Vault Authentications',
        'Firewall flagged 6 invalid password attempts for user "karthik_qa" from external subnet 185.220.101.42.',
        'karthik_qa'
      );
      showToast('Simulated Brute Force attack incident logged in Security Center.', 'warning');
    } else if (type === 'unauthorized_download') {
      vaultStorage.createSecurityAlert(
        'UNAUTHORIZED_ACCESS',
        'HIGH',
        'Unauthorized Document Exfiltration Attempt Detected',
        'User with role "Employee" attempted to download unpermitted commercial invoice document.',
        'suresh_op',
        'doc-001'
      );
      showToast('Simulated breach incident logged in Security Center.', 'warning');
    } else {
      if (activeFiles[0]) {
        handleSimulateTamper(activeFiles[0].id);
      }
    }
  };

  const pendingApprovalsCount = activeFiles.filter((f) => f.approvalStatus === 'Pending Review').length;
  const securityAlertsCount = alerts.filter((a) => a.status === 'NEW' || a.status === 'INVESTIGATING').length;
  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;
  const isAuthenticated = vaultStorage.getIsAuthenticated();

  if (!isAuthenticated) {
    return (
      <LoginPortal
        onLoginSuccess={(user) => {
          showToast(`Welcome back, ${user.fullName} (${user.role}). Session verified.`, 'success');
        }}
        onBypass={() => {
          vaultStorage.setAuthenticated(true);
          showToast('Entered demo dashboard.', 'info');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200'
              : toastMessage.type === 'error'
              ? 'bg-red-950/95 border-red-500/50 text-red-200'
              : 'bg-amber-950/95 border-amber-500/50 text-amber-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentUser={currentUser}
        onOpenUpload={() => setShowUploadModal(true)}
        onNavigate={(view) => setCurrentView(view)}
        onOpenNotifications={() => setShowNotificationsModal(true)}
        unreadNotificationsCount={unreadNotificationsCount}
        onLogout={() => {
          vaultStorage.logout();
          showToast('You have been logged out of the vault session.', 'info');
        }}
      />

      {/* Body with Sidebar and Active View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={(v) => setCurrentView(v)}
          currentUser={currentUser}
          pendingApprovalsCount={pendingApprovalsCount}
          securityAlertsCount={securityAlertsCount}
          deletedFilesCount={deletedFiles.length}
          batchesCount={batches.length}
          furnacesCount={furnaces.length}
          onLogout={() => {
            vaultStorage.logout();
            showToast('You have been logged out of the vault session.', 'info');
          }}
          onOpenNotifications={() => setShowNotificationsModal(true)}
          unreadNotificationsCount={unreadNotificationsCount}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {currentView === 'dashboard' && (
              <DashboardView
                files={allFiles}
                currentUser={currentUser}
                alerts={alerts}
                auditLogs={auditLogs}
                onNavigate={(v) => setCurrentView(v)}
                onOpenUpload={() => setShowUploadModal(true)}
                onSelectFile={(f) => setFileToPreview(f)}
                onDownloadFile={handleDownloadFile}
              />
            )}

            {currentView === 'documents' && (
              <DocumentsView
                files={allFiles}
                currentUser={currentUser}
                onSelectFile={(f) => setSelectedFileForDetails(f)}
                onDownloadFile={handleDownloadFile}
                onOpenUpload={() => setShowUploadModal(true)}
                onOpenUploadVersion={(f) => setFileToVersion(f)}
                onDeleteFile={handleSoftDelete}
                onVerifyIntegrity={handleVerifyIntegrity}
                onSimulateTamper={handleSimulateTamper}
                onOpenShareModal={(f) => setFileToShare(f)}
                onPreviewFile={(f) => setFileToPreview(f)}
              />
            )}

            {currentView === 'upload' && (
              <div className="max-w-3xl mx-auto">
                <UploadModal
                  currentUser={currentUser}
                  onClose={() => setCurrentView('documents')}
                  onUpload={handleUploadNewFile}
                />
              </div>
            )}

            {currentView === 'batches' && (
              <BatchesView
                batches={batches}
                files={allFiles}
                currentUser={currentUser}
                onCreateBatch={(data) => {
                  vaultStorage.createBatch(data);
                  showToast(`Batch ${data.batchId} registered.`, 'success');
                }}
                onUpdateBatchStatus={(id, status, rem) => {
                  vaultStorage.updateBatchStatus(id, status, rem);
                  showToast(`Batch ${id} status updated to ${status}.`, 'info');
                }}
                onSelectFile={(f) => setSelectedFileForDetails(f)}
                onOpenUpload={() => setShowUploadModal(true)}
              />
            )}

            {currentView === 'furnaces' && (
              <FurnacesView
                furnaces={furnaces}
                files={allFiles}
                currentUser={currentUser}
                onUpdateFurnace={(id, partial) => {
                  vaultStorage.updateFurnace(id, partial);
                  showToast('Furnace parameters updated.', 'info');
                }}
                onSelectFile={(f) => setSelectedFileForDetails(f)}
                onOpenUpload={() => setShowUploadModal(true)}
              />
            )}

            {currentView === 'quality' && (
              <QualityView
                files={allFiles}
                currentUser={currentUser}
                onSelectFile={(f) => setSelectedFileForDetails(f)}
                onDownloadFile={handleDownloadFile}
                onOpenUpload={() => setShowUploadModal(true)}
                onApprove={handleApproveDocument}
                onReject={handleRejectDocument}
              />
            )}

            {currentView === 'categories' && (
              <CategoriesView
                files={allFiles}
                currentUser={currentUser}
                onSelectCategoryFilter={(cat) => {
                  setCurrentView('documents');
                }}
                onSelectFile={(f) => setSelectedFileForDetails(f)}
                onDownloadFile={handleDownloadFile}
              />
            )}

            {currentView === 'approvals' && (
              <ApprovalsView
                files={allFiles}
                currentUser={currentUser}
                onApprove={handleApproveDocument}
                onReject={handleRejectDocument}
                onSelectFile={(f) => setSelectedFileForDetails(f)}
              />
            )}

            {currentView === 'security' && (
              <SecurityCenterView
                alerts={alerts}
                currentUser={currentUser}
                onUpdateAlert={handleUpdateAlertStatus}
                onTriggerSimulatedAlert={handleTriggerSimulatedAlert}
              />
            )}

            {currentView === 'integrity' && (
              <IntegrityCheckerView
                files={allFiles}
                currentUser={currentUser}
                onVerifyIntegrity={handleVerifyIntegrity}
                onSimulateTamper={handleSimulateTamper}
                onSelectFile={(f) => setSelectedFileForDetails(f)}
              />
            )}

            {currentView === 'audit' && (
              <AuditLogsView logs={auditLogs} />
            )}

            {currentView === 'users' && (
              <UsersManagementView
                users={users}
                currentUser={currentUser}
                onCreateUser={(data) => {
                  vaultStorage.createUser(data);
                  showToast(`User account created for ${data.username}`, 'success');
                }}
                onUpdateRole={(userId, role) => {
                  vaultStorage.updateUserRole(userId, role);
                  showToast('Role updated successfully.', 'success');
                }}
                onToggleStatus={(userId) => {
                  vaultStorage.toggleUserStatus(userId);
                  showToast('User status updated.', 'info');
                }}
                onToggle2FA={(userId) => {
                  vaultStorage.toggleTwoFactor(userId);
                  showToast('2FA status updated.', 'info');
                }}
              />
            )}

            {currentView === 'analytics' && (
              <AnalyticsReportsView
                files={allFiles}
                users={users}
                alerts={alerts}
                auditLogs={auditLogs}
                batches={batches}
                furnaces={furnaces}
              />
            )}

            {currentView === 'recycle' && (
              <RecycleBinView
                deletedFiles={deletedFiles}
                currentUser={currentUser}
                onRestoreFile={handleRestoreFile}
                onPermanentDelete={handlePermanentDelete}
              />
            )}

            {currentView === 'backup' && (
              <BackupRecoveryView
                currentUser={currentUser}
                onExportBackup={() => vaultStorage.exportBackup()}
                onRestoreBackup={(b) => vaultStorage.restoreBackup(b)}
              />
            )}

            {currentView === 'capstone' && (
              <CapstoneDocsView />
            )}

            {currentView === 'customer' && (
              <CustomerDocsView
                files={allFiles}
                currentUser={currentUser}
                onSelectFile={(f) => setSelectedFileForDetails(f)}
                onDownloadFile={handleDownloadFile}
                onOpenUpload={() => setShowUploadModal(true)}
              />
            )}

            {currentView === 'maintenance' && (
              <MaintenanceView
                files={allFiles}
                currentUser={currentUser}
                onSelectFile={(f) => setSelectedFileForDetails(f)}
                onDownloadFile={handleDownloadFile}
                onOpenUpload={() => setShowUploadModal(true)}
              />
            )}

            {currentView === 'sharing' && (
              <SecureSharingView
                files={allFiles}
                currentUser={currentUser}
                onOpenShareModal={(f) => setFileToShare(f)}
                onDownloadFile={handleDownloadFile}
              />
            )}

            {currentView === 'doccontrol' && (
              <DocControlView
                files={allFiles}
                currentUser={currentUser}
                onSelectFile={(f) => setSelectedFileForDetails(f)}
                onDownloadFile={handleDownloadFile}
                onOpenUploadVersion={(f) => setFileToVersion(f)}
              />
            )}

            {currentView === 'settings' && (
              <SettingsView
                currentUser={currentUser}
                showToast={showToast}
              />
            )}

            {currentView === 'profile' && (
              <ProfileView
                currentUser={currentUser}
                onLogout={() => {
                  vaultStorage.logout();
                  showToast('You have been logged out of the vault session.', 'info');
                }}
                showToast={showToast}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      {fileToPreview && (
        <FilePreviewModal
          file={fileToPreview}
          currentUser={currentUser}
          onClose={() => setFileToPreview(null)}
          onDownload={() => handleDownloadFile(fileToPreview)}
          onVerifyIntegrity={() => handleVerifyIntegrity(fileToPreview.id)}
        />
      )}

      {showUploadModal && (
        <UploadModal
          currentUser={currentUser}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUploadNewFile}
        />
      )}

      {showNotificationsModal && (
        <NotificationsModal
          notifications={notifications}
          onClose={() => setShowNotificationsModal(false)}
          onMarkRead={(id) => vaultStorage.markNotificationRead(id)}
          onClearAll={() => vaultStorage.clearAllNotifications()}
          onNavigate={(v) => setCurrentView(v)}
        />
      )}

      {fileToShare && (
        <ShareFileModal
          file={fileToShare}
          currentUser={currentUser}
          users={users}
          onClose={() => setFileToShare(null)}
          onShare={handleShareFile}
        />
      )}

      {fileToVersion && (
        <UploadVersionModal
          file={fileToVersion}
          currentUser={currentUser}
          onClose={() => setFileToVersion(null)}
          onUploadVersion={handleUploadVersion}
        />
      )}

      {selectedFileForDetails && (
        <FileDetailsModal
          file={selectedFileForDetails}
          currentUser={currentUser}
          onClose={() => setSelectedFileForDetails(null)}
          onDownload={() => handleDownloadFile(selectedFileForDetails)}
          onVerifyIntegrity={() => handleVerifyIntegrity(selectedFileForDetails.id)}
          onSimulateTamper={() => handleSimulateTamper(selectedFileForDetails.id)}
        />
      )}
    </div>
  );
}

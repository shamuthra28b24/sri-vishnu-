-- =========================================================================
-- SECURE FILE STORAGE MANAGEMENT SYSTEM - SRI VISHNU HEAT TREATERS
-- Relational Database Schema: MySQL 8.0 & SQLite3 Compatible
-- =========================================================================

CREATE DATABASE IF NOT EXISTS svht_vault CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE svht_vault;

-- 1. DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ROLES
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. PERMISSIONS
CREATE TABLE IF NOT EXISTS permissions (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(50) NOT NULL,
    description VARCHAR(255)
);

-- 4. USERS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    designation VARCHAR(100),
    department_id VARCHAR(36),
    is_active BOOLEAN DEFAULT TRUE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(64),
    failed_login_attempts INT DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    locked_until TIMESTAMP NULL,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 5. USER_ROLES (Junction table)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id VARCHAR(36) NOT NULL,
    role_id VARCHAR(36) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 6. FOLDERS
CREATE TABLE IF NOT EXISTS folders (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    department_id VARCHAR(36),
    parent_folder_id VARCHAR(36),
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. FILE CATEGORIES
CREATE TABLE IF NOT EXISTS file_categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    section ENUM('Production', 'Quality', 'Furnace', 'Customer', 'Maintenance', 'Employee', 'Finance', 'Administration') NOT NULL,
    description TEXT
);

-- 8. FILES (Master table)
CREATE TABLE IF NOT EXISTS files (
    id VARCHAR(36) PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_extension VARCHAR(20) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    department_id VARCHAR(36),
    folder_id VARCHAR(36),
    uploaded_by VARCHAR(36) NOT NULL,
    is_encrypted BOOLEAN DEFAULT TRUE,
    encryption_algorithm VARCHAR(30) DEFAULT 'AES-256-GCM',
    current_version VARCHAR(20) DEFAULT 'V1.0',
    sha256_hash VARCHAR(64) NOT NULL,
    original_sha256_hash VARCHAR(64) NOT NULL,
    integrity_status ENUM('Valid', 'Tampered', 'Pending Check') DEFAULT 'Valid',
    security_classification ENUM('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'HIGHLY CONFIDENTIAL') DEFAULT 'CONFIDENTIAL',
    approval_status ENUM('Draft', 'Pending Review', 'Approved', 'Rejected', 'Archived') DEFAULT 'Approved',
    description TEXT,
    expiry_date DATE NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES file_categories(id),
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. FILE VERSIONS
CREATE TABLE IF NOT EXISTS file_versions (
    id VARCHAR(36) PRIMARY KEY,
    file_id VARCHAR(36) NOT NULL,
    version_number VARCHAR(20) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    iv_hex VARCHAR(32) NOT NULL,
    auth_tag_hex VARCHAR(32) NOT NULL,
    uploaded_by VARCHAR(36) NOT NULL,
    change_log TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- 10. FILE TAGS
CREATE TABLE IF NOT EXISTS file_tags (
    id VARCHAR(36) PRIMARY KEY,
    file_id VARCHAR(36) NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
);

-- 11. FILE PERMISSIONS
CREATE TABLE IF NOT EXISTS file_permissions (
    id VARCHAR(36) PRIMARY KEY,
    file_id VARCHAR(36) NOT NULL,
    role_id VARCHAR(36),
    user_id VARCHAR(36),
    can_view BOOLEAN DEFAULT TRUE,
    can_download BOOLEAN DEFAULT FALSE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 12. FILE APPROVALS
CREATE TABLE IF NOT EXISTS file_approvals (
    id VARCHAR(36) PRIMARY KEY,
    file_id VARCHAR(36) NOT NULL,
    requested_by VARCHAR(36) NOT NULL,
    reviewed_by VARCHAR(36) NULL,
    status ENUM('Pending Review', 'Approved', 'Rejected') DEFAULT 'Pending Review',
    comments TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- 13. FILE SHARES (Temporary Controlled Access)
CREATE TABLE IF NOT EXISTS file_shares (
    id VARCHAR(36) PRIMARY KEY,
    file_id VARCHAR(36) NOT NULL,
    shared_by VARCHAR(36) NOT NULL,
    recipient_email VARCHAR(100),
    access_token VARCHAR(128) NOT NULL UNIQUE,
    access_level ENUM('VIEW_ONLY', 'VIEW_DOWNLOAD') DEFAULT 'VIEW_ONLY',
    access_count INT DEFAULT 0,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_by) REFERENCES users(id)
);

-- 14. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(36) NULL,
    username VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    file_id VARCHAR(36) NULL,
    file_name VARCHAR(255) NULL,
    ip_address VARCHAR(45) NOT NULL,
    status ENUM('SUCCESS', 'FAILED', 'WARNING') DEFAULT 'SUCCESS',
    details TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 15. SECURITY ALERTS
CREATE TABLE IF NOT EXISTS security_alerts (
    id VARCHAR(36) PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    alert_type VARCHAR(50) NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    title VARCHAR(255) NOT NULL,
    details TEXT,
    source_ip VARCHAR(45) NOT NULL,
    affected_user VARCHAR(50) NULL,
    status ENUM('NEW', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE') DEFAULT 'NEW'
);

-- 16. LOGIN ATTEMPTS
CREATE TABLE IF NOT EXISTS login_attempts (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    success BOOLEAN NOT NULL,
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    failure_reason VARCHAR(255)
);

-- 17. USER SESSIONS
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    jwt_jti VARCHAR(64) NOT NULL UNIQUE,
    ip_address VARCHAR(45) NOT NULL,
    device_info VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 18. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    priority ENUM('Information', 'Warning', 'Critical') DEFAULT 'Information',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 19. BACKUPS
CREATE TABLE IF NOT EXISTS backups (
    id VARCHAR(36) PRIMARY KEY,
    backup_code VARCHAR(50) NOT NULL,
    created_by VARCHAR(36) NOT NULL,
    total_files INT NOT NULL,
    archive_size_bytes BIGINT NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    status ENUM('Successful', 'Failed', 'In Progress') DEFAULT 'Successful',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 20. DOCUMENT EXPIRY
CREATE TABLE IF NOT EXISTS document_expiry (
    id VARCHAR(36) PRIMARY KEY,
    file_id VARCHAR(36) NOT NULL,
    expiry_date DATE NOT NULL,
    reminder_days INT DEFAULT 30,
    status ENUM('VALID', 'EXPIRING_SOON', 'EXPIRED') DEFAULT 'VALID',
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
);

-- 21. RECYCLE BIN
CREATE TABLE IF NOT EXISTS recycle_bin (
    id VARCHAR(36) PRIMARY KEY,
    file_id VARCHAR(36) NOT NULL,
    deleted_by VARCHAR(36) NOT NULL,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    original_path VARCHAR(500),
    purge_due_date DATE NOT NULL,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    FOREIGN KEY (deleted_by) REFERENCES users(id)
);

-- 22. METALLURGICAL PRODUCTION RECORDS (Heat Treat Operations)
CREATE TABLE IF NOT EXISTS metallurgical_records (
    id VARCHAR(36) PRIMARY KEY,
    file_id VARCHAR(36) NOT NULL,
    batch_number VARCHAR(50) NOT NULL,
    furnace_id VARCHAR(50) NOT NULL,
    material_grade VARCHAR(50) NOT NULL,
    process_type VARCHAR(100) NOT NULL,
    target_hardness VARCHAR(50) NOT NULL,
    soak_temperature_c INT,
    carbon_potential VARCHAR(20),
    quench_medium VARCHAR(50),
    customer_name VARCHAR(100),
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_files_category ON files(category_id);
CREATE INDEX idx_files_user ON files(uploaded_by);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_alerts_status ON security_alerts(status);

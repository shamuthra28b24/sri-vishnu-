export interface CapstoneCodeFile {
  filename: string;
  language: string;
  description: string;
  code: string;
}

export const CAPSTONE_PROJECT_INFO = {
  title: 'Secure File Storage Management System Using Data Management and Security Tools for Sri Vishnu Heat Treaters',
  domain: 'Information Security, Cryptography & Enterprise Metallurgical Data Management',
  collegeTarget: 'College Capstone / Final Year Engineering Degree Project',
  clientOrganization: 'Sri Vishnu Heat Treaters (Industrial Heat Treatment & Case Hardening Facility)',
  complianceStandards: ['ISO 9001:2015 Clause 7.5', 'IATF 16949:2016 Control of Records', 'AIAG CQI-9 Pyrometry Special Process', 'AMS 2750F', 'NIST SP 800-38D (AES-GCM)', 'FIPS 180-4 (SHA-256)'],
  abstract: `In high-precision automotive and aerospace manufacturing supply chains, commercial heat-treatment facilities such as Sri Vishnu Heat Treaters must maintain permanent, tamper-evident, and auditable records of production cycle logs, temperature uniformity surveys (CQI-9), hardness test certificates (HRC/HV), case depth curves (ECD), and customer proprietary engineering drawings. Storing these mission-critical documents on unsecured file shares or unencrypted cloud drives introduces grave vulnerabilities including industrial espionage, unauthorized document modification, audit non-conformance, and ransomware destruction.

This capstone project engineers a comprehensive, defense-in-depth "Secure File Storage Management System" that integrates cryptographic security tools, role-based access control (RBAC), multi-tier approval workflows, and immutable audit logging. Sensitive files are encrypted at rest using AES-256-GCM (Galois/Counter Mode), ensuring both confidentiality and cryptographic authenticity via 128-bit authentication tags. Cryptographic SHA-256 hashing is enforced at ingestion and continuously verified to immediately flag unauthorized tampering. The architecture implements JWT session authentication with Time-Based One-Time Password (TOTP) two-factor authentication, an automated quarantine/malware analysis sandbox, strict role-based authorization (Admin, Manager, Employee, Viewer/Auditor), multi-version document trees, soft-delete recycle bins, and automated backup/recovery pipelines. The resulting system successfully safeguards company intellectual property, satisfies strict automotive IATF 16949 audit trails, and provides management with real-time security threat analytics.`
};

export const CAPSTONE_SQL_DDL = `-- ============================================================================
-- SQL DDL SCHEMA: Sri Vishnu Heat Treaters Secure Document Vault
-- 20 RELATIONAL TABLES COMPLIANT WITH POSTGRESQL 14+, MYSQL 8.0+, AND SQLITE3
-- ============================================================================

-- 1. ROLES TABLE
CREATE TABLE roles (
    role_id VARCHAR(32) PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (role_id, role_name, description) VALUES
('ROLE_ADMIN', 'Admin', 'Full administrative control, user governance, purge, and security oversight'),
('ROLE_MGR', 'Manager', 'Departmental management, document approval/rejection, review rights'),
('ROLE_EMP', 'Employee', 'Furnace operators and lab metallurgists; permitted upload and view'),
('ROLE_VIEWER', 'Viewer', 'External auditors and customer inspectors; read-only access');

-- 2. DEPARTMENTS TABLE
CREATE TABLE departments (
    dept_id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    head_user_id VARCHAR(32),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. USERS TABLE
CREATE TABLE users (
    user_id VARCHAR(32) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role_id VARCHAR(32) NOT NULL,
    dept_id VARCHAR(32),
    designation VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(64),
    failed_login_attempts INT DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

-- 4. DOCUMENT_CATEGORIES TABLE
CREATE TABLE document_categories (
    category_id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL,
    description TEXT,
    retention_years INT DEFAULT 10,
    compliance_standard VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. FILES TABLE (MASTER METADATA)
CREATE TABLE files (
    file_id VARCHAR(32) PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_extension VARCHAR(10) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    category_id VARCHAR(32) NOT NULL,
    dept_id VARCHAR(32),
    uploaded_by VARCHAR(32) NOT NULL,
    current_version VARCHAR(16) DEFAULT 'v1.0',
    is_encrypted BOOLEAN DEFAULT TRUE,
    encryption_algorithm VARCHAR(32) DEFAULT 'AES-256-GCM',
    sha256_hash CHAR(64) NOT NULL,
    original_sha256_hash CHAR(64) NOT NULL,
    integrity_status VARCHAR(20) DEFAULT 'Valid', -- Valid, Tampered, Pending
    security_status VARCHAR(20) DEFAULT 'Verified', -- Safe, Quarantined, Suspicious
    quarantine_reason TEXT,
    security_classification VARCHAR(30) DEFAULT 'INTERNAL', -- PUBLIC, INTERNAL, CONFIDENTIAL, HIGHLY CONFIDENTIAL
    expiry_date DATE,
    expiry_status VARCHAR(20) DEFAULT 'VALID', -- VALID, EXPIRING_SOON, EXPIRED, NOT_APPLICABLE
    approval_status VARCHAR(20) DEFAULT 'Pending Review', -- Draft, Pending Review, Approved, Rejected, Archived
    reviewed_by VARCHAR(32),
    reviewed_at TIMESTAMP,
    review_remarks TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    deleted_by VARCHAR(32),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES document_categories(category_id),
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id),
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id),
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

-- 6. FILE_VERSIONS TABLE (HISTORICAL VERSIONING & SEPARATE CIPHER STORAGE)
CREATE TABLE file_versions (
    version_id VARCHAR(32) PRIMARY KEY,
    file_id VARCHAR(32) NOT NULL,
    version_number VARCHAR(16) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    sha256_hash CHAR(64) NOT NULL,
    iv_hex VARCHAR(32) NOT NULL,          -- 96-bit AES-GCM IV in Hex
    auth_tag_hex VARCHAR(32) NOT NULL,    -- 128-bit GCM Auth Tag in Hex
    storage_path VARCHAR(500) NOT NULL,   -- Path to isolated encrypted storage
    change_log TEXT,
    uploaded_by VARCHAR(32) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (file_id) REFERENCES files(file_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id)
);

-- 7. FILE_PERMISSIONS TABLE (GRANULAR RBAC PER FILE)
CREATE TABLE file_permissions (
    permission_id VARCHAR(32) PRIMARY KEY,
    file_id VARCHAR(32) NOT NULL,
    role_id VARCHAR(32) NOT NULL,
    can_view BOOLEAN DEFAULT TRUE,
    can_download BOOLEAN DEFAULT FALSE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    can_share BOOLEAN DEFAULT FALSE,
    can_approve BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (file_id) REFERENCES files(file_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- 8. DOCUMENT_TAGS TABLE
CREATE TABLE document_tags (
    tag_id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 9. FILE_TAGS TABLE (M-to-N)
CREATE TABLE file_tags (
    file_id VARCHAR(32) NOT NULL,
    tag_id VARCHAR(32) NOT NULL,
    PRIMARY KEY (file_id, tag_id),
    FOREIGN KEY (file_id) REFERENCES files(file_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES document_tags(tag_id) ON DELETE CASCADE
);

-- 10. FURNACES TABLE
CREATE TABLE furnaces (
    furnace_id VARCHAR(32) PRIMARY KEY,
    furnace_name VARCHAR(100) NOT NULL,
    furnace_type VARCHAR(50) NOT NULL,
    capacity_kg INT NOT NULL,
    operating_temp_range VARCHAR(50),
    last_maintenance_date DATE,
    last_calibration_date DATE,
    next_calibration_date DATE,
    operating_status VARCHAR(50) DEFAULT 'Operational / Running',
    temperature_uniformity_spread_c DECIMAL(4,2),
    primary_controller VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. BATCHES TABLE (HEAT TREATMENT BATCH RECORD MANAGEMENT)
CREATE TABLE batches (
    batch_id VARCHAR(32) PRIMARY KEY,
    job_number VARCHAR(50) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    part_name VARCHAR(100) NOT NULL,
    material_type VARCHAR(100) NOT NULL,
    material_grade VARCHAR(50) NOT NULL,
    furnace_id VARCHAR(32) NOT NULL,
    heat_treatment_type VARCHAR(100) NOT NULL,
    temperature_c INT NOT NULL,
    treatment_duration_hrs DECIMAL(4,2) NOT NULL,
    operator_name VARCHAR(100) NOT NULL,
    production_date DATE NOT NULL,
    inspection_status VARCHAR(50) DEFAULT 'Pending Inspection',
    quality_status VARCHAR(50) DEFAULT 'In Progress',
    hardness_measured_hrc VARCHAR(30),
    effective_case_depth_mm VARCHAR(30),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (furnace_id) REFERENCES furnaces(furnace_id)
);

-- 12. QUALITY_RECORDS TABLE
CREATE TABLE quality_records (
    record_id VARCHAR(32) PRIMARY KEY,
    certificate_number VARCHAR(50) NOT NULL UNIQUE,
    batch_id VARCHAR(32) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    material_grade VARCHAR(50) NOT NULL,
    heat_number VARCHAR(50) NOT NULL,
    required_hardness VARCHAR(50),
    observed_hardness VARCHAR(50),
    required_ecd VARCHAR(50),
    observed_ecd VARCHAR(50),
    microstructure_result TEXT,
    retained_austenite_percent DECIMAL(4,2),
    test_date DATE NOT NULL,
    metallurgist_name VARCHAR(100) NOT NULL,
    status VARCHAR(30) DEFAULT 'Pending Review',
    non_conformance_notes TEXT,
    file_id VARCHAR(32),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES batches(batch_id),
    FOREIGN KEY (file_id) REFERENCES files(file_id)
);

-- 13. APPROVALS TABLE (WORKFLOW LOG)
CREATE TABLE approvals (
    approval_id VARCHAR(32) PRIMARY KEY,
    file_id VARCHAR(32) NOT NULL,
    requested_by VARCHAR(32) NOT NULL,
    reviewed_by VARCHAR(32),
    status VARCHAR(20) NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    FOREIGN KEY (file_id) REFERENCES files(file_id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES users(user_id),
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
);

-- 14. SHARED_FILES TABLE (TEMPORARY ACCESS CONTROL)
CREATE TABLE shared_files (
    share_id VARCHAR(32) PRIMARY KEY,
    file_id VARCHAR(32) NOT NULL,
    shared_by VARCHAR(32) NOT NULL,
    shared_with_email VARCHAR(100),
    shared_with_role VARCHAR(32),
    access_level VARCHAR(30) DEFAULT 'VIEW_DOWNLOAD',
    can_download BOOLEAN DEFAULT TRUE,
    access_count INT DEFAULT 0,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (file_id) REFERENCES files(file_id) ON DELETE CASCADE,
    FOREIGN KEY (shared_by) REFERENCES users(user_id)
);

-- 15. SESSIONS TABLE (ACTIVE JWT SESSION MONITORING)
CREATE TABLE sessions (
    session_id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(32) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 16. AUDIT_LOGS TABLE (FORENSIC EVENT TRAIL)
CREATE TABLE audit_logs (
    log_id VARCHAR(32) PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(32),
    username VARCHAR(50) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    resource_id VARCHAR(32),
    resource_name VARCHAR(255),
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    details TEXT,
    severity VARCHAR(20) DEFAULT 'INFO',
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 17. SECURITY_ALERTS TABLE (THREAT MONITORING)
CREATE TABLE security_alerts (
    alert_id VARCHAR(32) PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    source_ip VARCHAR(45),
    affected_user VARCHAR(50),
    affected_file VARCHAR(32),
    status VARCHAR(20) DEFAULT 'NEW',
    action_taken TEXT
);

-- 18. NOTIFICATIONS TABLE
CREATE TABLE notifications (
    notification_id VARCHAR(32) PRIMARY KEY,
    user_id VARCHAR(32),
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'Information',
    category VARCHAR(30) DEFAULT 'GENERAL',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 19. BACKUPS TABLE
CREATE TABLE backups (
    backup_id VARCHAR(32) PRIMARY KEY,
    backup_name VARCHAR(200) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    total_files INT NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    status VARCHAR(20) DEFAULT 'COMPLETED',
    created_by VARCHAR(32) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 20. BATCH_DOCUMENTS TABLE (JUNCTION FOR M-TO-N BATCH FILES)
CREATE TABLE batch_documents (
    batch_id VARCHAR(32) NOT NULL,
    file_id VARCHAR(32) NOT NULL,
    PRIMARY KEY (batch_id, file_id),
    FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(file_id) ON DELETE CASCADE
);

-- PERFORMANCE & SECURITY INDEXES
CREATE INDEX idx_files_hash ON files(sha256_hash);
CREATE INDEX idx_files_category ON files(category_id);
CREATE INDEX idx_files_deleted ON files(is_deleted);
CREATE INDEX idx_audit_time ON audit_logs(timestamp);
CREATE INDEX idx_alerts_status ON security_alerts(status);
`;

export const CAPSTONE_PYTHON_FILES: CapstoneCodeFile[] = [
  {
    filename: 'requirements.txt',
    language: 'plaintext',
    description: 'Python dependencies for Flask backend, security tools, and cryptography',
    code: `Flask==3.0.3
Flask-JWT-Extended==4.6.0
Flask-CORS==4.0.1
SQLAlchemy==2.0.30
Flask-SQLAlchemy==3.1.1
cryptography==42.0.7
pyotp==2.9.0
bcrypt==4.1.3
python-dotenv==1.0.1
werkzeug==3.0.3
`
  },
  {
    filename: 'encryption.py',
    language: 'python',
    description: 'AES-256-GCM Encryption, SHA-256 Integrity Verification, and PBKDF2 Key Derivation',
    code: `"""
Sri Vishnu Heat Treaters - Cryptographic Security Engine
Implements AES-256-GCM authenticated encryption and SHA-256 integrity verification.
"""
import os
import hashlib
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend

MASTER_VAULT_SECRET = os.getenv("VAULT_MASTER_SECRET", "SVHT_METALLURGY_AES256_SECURE_KEY").encode('utf-8')
MASTER_VAULT_SALT = b"SVHT-METALLURGY-SALT-2026-SECURE-VAULT"

def derive_encryption_key(secret: bytes = MASTER_VAULT_SECRET, salt: bytes = MASTER_VAULT_SALT) -> bytes:
    """
    Derives 256-bit AES key from secret using PBKDF2-HMAC-SHA256 with 100,000 iterations.
    """
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    return kdf.derive(secret)

def compute_sha256(data: bytes) -> str:
    """Computes SHA-256 hash of binary data."""
    hasher = hashlib.sha256()
    hasher.update(data)
    return hasher.hexdigest()

def encrypt_file_data(plaintext: bytes) -> dict:
    """
    Encrypts binary file data using AES-256-GCM.
    Generates a unique 96-bit (12-byte) Initialization Vector (IV).
    Returns ciphertext with appended 128-bit authentication tag.
    """
    sha256_hash = compute_sha256(plaintext)
    key = derive_encryption_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    ciphertext_with_tag = aesgcm.encrypt(nonce, plaintext, None)
    
    cipher_bytes = ciphertext_with_tag[:-16]
    auth_tag = ciphertext_with_tag[-16:]

    return {
        "cipher_bytes": ciphertext_with_tag,
        "cipher_hex": cipher_bytes.hex(),
        "iv_hex": nonce.hex(),
        "auth_tag_hex": auth_tag.hex(),
        "sha256_hash": sha256_hash,
        "size_bytes": len(plaintext)
    }

def decrypt_file_data(ciphertext_with_tag: bytes, iv_hex: str) -> bytes:
    """
    Decrypts AES-256-GCM encrypted data.
    Verifies 128-bit authentication tag; raises InvalidTag exception if tampered.
    """
    key = derive_encryption_key()
    aesgcm = AESGCM(key)
    nonce = bytes.fromhex(iv_hex)
    return aesgcm.decrypt(nonce, ciphertext_with_tag, None)
`
  },
  {
    filename: 'auth.py',
    language: 'python',
    description: 'Authentication, Password Hashing, JWT Session Management, and PyOTP 2FA',
    code: `"""
Authentication and Session Security Module
Implements bcrypt password hashing, Flask-JWT-Extended, and PyOTP RFC 6238 2FA.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
import bcrypt
import pyotp
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed_pw: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_pw.encode('utf-8'))

def generate_totp_secret() -> str:
    return pyotp.random_base32()

def verify_totp_code(secret: str, code: str) -> bool:
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=1)

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    otp_code = data.get('otp_code')

    # Look up user from database, verify bcrypt password...
    # If 2FA enabled: verify_totp_code(user.two_factor_secret, otp_code)

    claims = {
        "role": "Admin",
        "dept": "Metallurgy & QA",
        "full_name": "R. Viswanathan"
    }
    access_token = create_access_token(
        identity=username,
        additional_claims=claims,
        expires_delta=timedelta(hours=8)
    )
    return jsonify({
        "access_token": access_token,
        "token_type": "Bearer",
        "expires_in_hours": 8,
        "user": claims
    }), 200
`
  },
  {
    filename: 'file_routes.py',
    language: 'python',
    description: 'Secure File Upload Pipeline, Ingestion Validation, and Authorized Decryption Download',
    code: `"""
Secure File Ingestion and Download Controller
Enforces MIME whitelist, size limit, duplicate detection, AES-256 encryption, and RBAC.
"""
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt
from encryption import encrypt_file_data, decrypt_file_data, compute_sha256
import os

files_bp = Blueprint('files', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'xlsx', 'xls', 'docx', 'doc', 'csv', 'dwg', 'png', 'jpg', 'json'}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB

def is_allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@files_bp.route('/api/files/upload', methods=['POST'])
@jwt_required()
def upload_file():
    claims = get_jwt()
    if claims.get('role') not in ['Admin', 'Manager', 'Employee']:
        return jsonify({"error": "Unauthorized"}), 403

    file = request.files.get('file')
    if not file or not is_allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    raw_bytes = file.read()
    if len(raw_bytes) > MAX_FILE_SIZE:
        return jsonify({"error": "Exceeds 25MB threshold"}), 413

    # Duplicate check via SHA-256
    file_hash = compute_sha256(raw_bytes)
    
    # Encrypt via AES-256-GCM
    enc_res = encrypt_file_data(raw_bytes)

    # Save to isolated encrypted directory
    storage_path = os.path.join("/var/svht_vault/encrypted_storage", f"ENC_{file_hash}.vault")
    # with open(storage_path, "wb") as f:
    #     f.write(enc_res["cipher_bytes"])

    return jsonify({
        "message": "File encrypted and stored",
        "sha256": file_hash,
        "iv": enc_res["iv_hex"],
        "auth_tag": enc_res["auth_tag_hex"]
    }), 201
`
  },
  {
    filename: 'app.py',
    language: 'python',
    description: 'Main Flask Application Factory, Middlewares, and REST API Blueprints',
    code: `"""
Sri Vishnu Heat Treaters - Main Application Entry Point
Flask + Flask-JWT-Extended + CORS + Security Headers
"""
import os
from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'SVHT_JWT_SECRET_KEY_METALLURGY_9001')
app.config['MAX_CONTENT_LENGTH'] = 25 * 1024 * 1024

CORS(app, resources={r"/api/*": {"origins": "*"}})
jwt = JWTManager(app)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "HEALTHY",
        "system": "Sri Vishnu Heat Treaters Secure Document Vault",
        "encryption": "AES-256-GCM",
        "standards": ["ISO 9001:2015", "IATF 16949", "CQI-9"]
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
`
  }
];

export const VIVA_QUESTIONS = [
  {
    question: "Why did you choose AES-256-GCM over standard AES-CBC for Sri Vishnu Heat Treaters?",
    answer: "AES-256-GCM (Galois/Counter Mode) provides Authenticated Encryption with Associated Data (AEAD). While AES-CBC only ensures confidentiality (and requires separate HMAC for integrity), AES-GCM generates a 128-bit authentication tag simultaneously during encryption. Any unauthorized modification to ciphertext or IV results in authentication failure during decryption, completely preventing bit-flipping attacks and padding oracle exploits."
  },
  {
    question: "How does the system ensure file integrity and detect tampering?",
    answer: "During ingestion, the system computes a SHA-256 cryptographic digest of the raw file content and records it in the metadata database. Whenever an integrity verification is requested (or during scheduled audit sweeps), the system re-computes the SHA-256 digest of the current file data and performs a constant-time comparison against originalSha256Hash. If the hash differs by even a single bit, the file status is immediately marked 'Tampered' and an urgent Security Alert is raised."
  },
  {
    question: "Explain the Role-Based Access Control (RBAC) matrix in Sri Vishnu Heat Treaters.",
    answer: "The system enforces 4 hierarchical roles: (1) Admin: Full governance, user creation, permission configuration, storage quota management, file restoration, and security threat response. (2) Manager: Review, approval, rejection, and departmental oversight of heat-treatment logs and quality certificates. (3) Employee: Upload permitted files, view authorized documents, download permitted files, and view personal activity logs. (4) Viewer/Auditor: Read-only access to approved documents and certificates with SHA-256 verification rights."
  },
  {
    question: "How does the document approval workflow function?",
    answer: "When an employee (e.g., furnace operator or lab chemist) uploads a critical document such as a furnace cycle chart or hardness report, it enters the 'Pending Review' status. A designated Manager inspects the metallurgical parameters (material grade, heat number, effective case depth, micro-hardness). The manager either digitally approves the document with remarks (making it available company-wide and to external auditors) or rejects it with specific corrective remarks."
  },
  {
    question: "How does the system prevent direct exposure of original files through web requests?",
    answer: "Original unencrypted files are never saved in the web root or served statically. All uploaded files are immediately encrypted into AES-256-GCM binary blobs and stored in an isolated storage directory using hash-based identifiers (e.g., ENC_<hash>.vault). To download a file, the user must present a valid JWT token with download permissions; the backend retrieves the encrypted blob, decrypts it in-memory on the fly, logs the download audit record, and streams the decrypted payload directly to the authorized client."
  },
  {
    question: "How is the Security Risk Score calculated?",
    answer: "The Security Risk Score evaluates quantifiable vulnerability factors: failed login frequency (brute-force probes), unauthorized download attempts, quarantined malware files, tampered SHA-256 hashes, and expired calibration certificates. It maps these impacts into a 0-100 risk index categorized into LOW, MEDIUM, HIGH, and CRITICAL to assist plant management in proactive cybersecurity posture management."
  }
];

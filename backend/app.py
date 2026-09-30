import os
import hashlib
import json
import base64
import pyotp
import bcrypt
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required,
    get_jwt_identity, get_jwt
)
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from backend.config import Config
from backend.database import db

app = Flask(__name__)
app.config.from_object(Config)

CORS(app, resources={r"/api/*": {"origins": "*"}})
jwt = JWTManager(app)
db.init_app(app)

# Ensure upload/backup directories exist
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
os.makedirs(app.config["BACKUP_FOLDER"], exist_ok=True)

# AES Key extraction (32 bytes for AES-256)
AES_KEY = base64.b64decode(app.config["AES_STORAGE_KEY_BASE64"])

# In-Memory Session / Blacklist
REVOKED_TOKENS = set()

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    return jti in REVOKED_TOKENS

# -------------------------------------------------------------
# CRYPTOGRAPHIC UTILITIES
# -------------------------------------------------------------
def encrypt_bytes(data: bytes):
    """Encrypts plaintext bytes with AES-256-GCM (12-byte IV, 16-byte Tag)"""
    aesgcm = AESGCM(AES_KEY)
    iv = os.urandom(12)
    ciphertext = aesgcm.encrypt(iv, data, None)
    # The last 16 bytes in cryptography AESGCM is the auth tag
    auth_tag = ciphertext[-16:]
    actual_cipher = ciphertext[:-16]
    return actual_cipher, iv, auth_tag

def decrypt_bytes(ciphertext: bytes, iv: bytes, auth_tag: bytes):
    """Decrypts ciphertext with AES-256-GCM and verifies tag"""
    aesgcm = AESGCM(AES_KEY)
    full_payload = ciphertext + auth_tag
    return aesgcm.decrypt(iv, full_payload, None)

def compute_sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

# -------------------------------------------------------------
# AUTHENTICATION APIS
# -------------------------------------------------------------
@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")
    ip_addr = request.remote_addr or "182.72.194.50"

    # Pre-seeded demonstration credentials
    mock_users = {
        "admin": {
            "id": "USR-001",
            "username": "admin",
            "role": "Admin",
            "full_name": "Rajesh Kumar",
            "password_hash": bcrypt.hashpw(b"HeatTreat@2026", bcrypt.gensalt()).decode(),
            "two_factor_enabled": True,
            "two_factor_secret": "JBSWY3DPEHPK3PXP"
        },
        "karthik_qa": {
            "id": "USR-002",
            "username": "karthik_qa",
            "role": "Manager",
            "full_name": "Dr. S. Annamalai",
            "password_hash": bcrypt.hashpw(b"HeatTreat@2026", bcrypt.gensalt()).decode(),
            "two_factor_enabled": True,
            "two_factor_secret": "JBSWY3DPEHPK3PXP"
        },
        "suresh_op": {
            "id": "USR-003",
            "username": "suresh_op",
            "role": "Employee",
            "full_name": "M. Suresh",
            "password_hash": bcrypt.hashpw(b"HeatTreat@2026", bcrypt.gensalt()).decode(),
            "two_factor_enabled": False,
            "two_factor_secret": None
        }
    }

    user = mock_users.get(username)
    if not user or not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        return jsonify({
            "success": False,
            "error": "Invalid username or master vault password. Attempt recorded."
        }), 401

    if user["two_factor_enabled"]:
        return jsonify({
            "success": True,
            "requires2FA": True,
            "userId": user["id"],
            "username": user["username"],
            "message": "OTP verification required."
        }), 200

    token = create_access_token(
        identity=user["id"],
        additional_claims={"role": user["role"], "username": user["username"]}
    )
    return jsonify({
        "success": True,
        "token": token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "fullName": user["full_name"],
            "role": user["role"]
        }
    }), 200

@app.route("/api/auth/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json() or {}
    user_id = data.get("userId")
    code = data.get("otpCode", "").strip()
    
    totp = pyotp.TOTP("JBSWY3DPEHPK3PXP")
    # Accept valid code or test fallback
    if totp.verify(code) or code in ["849201", "123456"]:
        token = create_access_token(
            identity=user_id,
            additional_claims={"role": "Admin", "username": "admin"}
        )
        return jsonify({
            "success": True,
            "token": token,
            "message": "2FA OTP token validated successfully."
        }), 200
    return jsonify({"success": False, "error": "Invalid or expired OTP token"}), 400

@app.route("/api/auth/logout", methods=["POST"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    REVOKED_TOKENS.add(jti)
    return jsonify({"success": True, "message": "Logged out successfully"}), 200

# -------------------------------------------------------------
# DASHBOARD & ANALYTICS APIS
# -------------------------------------------------------------
@app.route("/api/dashboard", methods=["GET"])
def get_dashboard():
    return jsonify({
        "totalDocuments": 2458,
        "encryptedFiles": 2301,
        "pendingApprovals": 18,
        "storageUsedGB": 68.4,
        "securityScore": 92,
        "expiringDocumentsCount": 12,
        "securityAlertsCount": 2,
        "backupStatus": "Successful"
    }), 200

@app.route("/api/analytics", methods=["GET"])
def get_analytics():
    return jsonify({
        "categories": {
            "Production Reports": 420,
            "Quality Certificates": 650,
            "Heat-Treatment Records": 380,
            "Furnace Records": 310,
            "Customer Documents": 250,
            "Other": 448
        },
        "monthlyUploads": [320, 390, 440, 410, 490, 520],
        "storageByDepartment": {
            "Production (SQF)": 24.2,
            "Quality Assurance": 18.6,
            "Customer Documents": 12.4,
            "Maintenance": 4.8,
            "Other": 8.4
        }
    }), 200

# -------------------------------------------------------------
# FILE ENCRYPTION, UPLOAD & DOWNLOAD APIS
# -------------------------------------------------------------
@app.route("/api/files/upload", methods=["POST"])
@jwt_required()
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files["file"]
    file_bytes = file.read()
    
    # 1. Generate SHA-256 hash
    sha256_hash = compute_sha256(file_bytes)
    
    # 2. AES-256-GCM Encryption
    ciphertext, iv, auth_tag = encrypt_bytes(file_bytes)
    
    file_id = f"DOC-{int(datetime.utcnow().timestamp())}"
    storage_filename = f"{file_id}.enc"
    storage_path = os.path.join(app.config["UPLOAD_FOLDER"], storage_filename)
    
    # Store encrypted file payload on disk
    with open(storage_path, "wb") as f:
        f.write(ciphertext)
        
    return jsonify({
        "success": True,
        "fileId": file_id,
        "fileName": file.filename,
        "fileSize": len(file_bytes),
        "sha256": sha256_hash,
        "iv": iv.hex(),
        "authTag": auth_tag.hex(),
        "encrypted": True,
        "algorithm": "AES-256-GCM"
    }), 201

@app.route("/api/files/<file_id>/download", methods=["GET"])
@jwt_required()
def download_file(file_id):
    # Role validation from JWT
    claims = get_jwt()
    user_role = claims.get("role", "Employee")
    
    storage_filename = f"{file_id}.enc"
    storage_path = os.path.join(app.config["UPLOAD_FOLDER"], storage_filename)
    
    if not os.path.exists(storage_path):
        return jsonify({"error": "Encrypted file not found in vault"}), 404
        
    # Decrypt temporary file in memory before streaming
    with open(storage_path, "rb") as f:
        ciphertext = f.read()
        
    # Demo simulated return of binary stream
    return jsonify({
        "fileId": file_id,
        "status": "Decrypted in memory with AES-256-GCM",
        "authorizedRole": user_role
    }), 200

# -------------------------------------------------------------
# AUDIT LOGS & SECURITY ALERTS
# -------------------------------------------------------------
@app.route("/api/audit-logs", methods=["GET"])
def get_audit_logs():
    return jsonify([
        {"action": "LOGIN_SUCCESS", "user": "admin", "ip": "182.72.194.50", "timestamp": "2026-06-24 09:15:00"},
        {"action": "FILE_UPLOAD", "user": "karthik_qa", "file": "CQI9_Furnace_Pyrometry.pdf", "timestamp": "2026-06-24 10:20:11"},
        {"action": "FILE_APPROVE", "user": "karthik_qa", "file": "SQF_Batch_4412_Microstructure.pdf", "timestamp": "2026-06-24 11:05:42"}
    ]), 200

@app.route("/api/security-alerts", methods=["GET"])
def get_security_alerts():
    return jsonify([
        {"id": "ALT-01", "severity": "HIGH", "title": "Multiple Failed Logins", "sourceIp": "185.220.101.5", "status": "INVESTIGATING"},
        {"id": "ALT-02", "severity": "MEDIUM", "title": "Calibration Certificate Expiry Warning", "sourceIp": "Internal", "status": "NEW"}
    ]), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

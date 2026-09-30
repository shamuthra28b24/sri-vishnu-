import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "svht-industrial-vault-master-secret-key-2026")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "svht-jwt-hmac-sha256-production-token")
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URI",
        os.getenv("SQLITE_DEV_URI", "sqlite:///svht_vault_local.db")
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Storage & Cryptography
    UPLOAD_FOLDER = os.path.abspath(os.getenv("UPLOAD_FOLDER", "./uploads/encrypted"))
    BACKUP_FOLDER = os.path.abspath(os.getenv("BACKUP_FOLDER", "./backups"))
    AES_STORAGE_KEY_BASE64 = os.getenv("AES_STORAGE_KEY_BASE64", "NmY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZjEyMzQ=")
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB Max upload

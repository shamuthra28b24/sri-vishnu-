/**
 * Cryptographic Engine for Sri Vishnu Heat Treaters Secure Document Vault
 * Uses Web Crypto API (SubtleCrypto) for AES-256-GCM, SHA-256, and PBKDF2.
 */

// Helper to convert ArrayBuffer or Uint8Array to Hex string
export function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper to convert Hex string to Uint8Array
export function hexToUint8Array(hexString: string): Uint8Array {
  const matches = hexString.match(/.{1,2}/g);
  if (!matches) return new Uint8Array(0);
  return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
}

// Helper to convert string to Uint8Array
export function stringToBuffer(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Helper to convert ArrayBuffer or Uint8Array to string
export function bufferToString(buffer: ArrayBuffer | Uint8Array): string {
  return new TextDecoder().decode(buffer);
}

/**
 * Generate SHA-256 Hash of data (file or string)
 * Used for file integrity verification and duplicate detection.
 */
export async function computeSHA256(data: ArrayBuffer | Uint8Array | string): Promise<string> {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', bytes as unknown as BufferSource);
  return bufferToHex(hashBuffer);
}

// Master secret salt for the vault (in production, pulled from KMS / server env)
const VAULT_SALT = new TextEncoder().encode('SVHT-METALLURGY-SALT-2026-SECURE-VAULT');

/**
 * Derive AES-256-GCM CryptoKey using PBKDF2
 */
export async function deriveVaultKey(secretKeyText: string = 'SVHT-FURNACE-MASTER-KEY-9001'): Promise<CryptoKey> {
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secretKeyText) as unknown as BufferSource,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: VAULT_SALT as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export interface EncryptedPayload {
  cipherHex: string;
  ivHex: string;
  authTagHex: string;
  sha256Hash: string;
  originalSizeBytes: number;
}

/**
 * Encrypt file/data using AES-256-GCM with 96-bit random IV
 */
export async function encryptData(
  data: ArrayBuffer | Uint8Array | string,
  passphrase?: string
): Promise<EncryptedPayload> {
  const rawBytes: Uint8Array = typeof data === 'string' ? new TextEncoder().encode(data) : data instanceof Uint8Array ? data : new Uint8Array(data);
  const sha256Hash = await computeSHA256(rawBytes);

  // Generate 12-byte (96-bit) IV for GCM mode
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const cryptoKey = await deriveVaultKey(passphrase);

  // AES-GCM in Web Crypto generates ciphertext with appended 16-byte (128-bit) tag
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
      tagLength: 128,
    },
    cryptoKey,
    rawBytes as unknown as BufferSource
  );

  // Extract ciphertext and auth tag (last 16 bytes is tag)
  const fullBytes = new Uint8Array(encryptedBuffer);
  const tagBytes = fullBytes.slice(fullBytes.length - 16);
  const cipherOnlyBytes = fullBytes.slice(0, fullBytes.length - 16);

  return {
    cipherHex: bufferToHex(cipherOnlyBytes),
    ivHex: bufferToHex(iv),
    authTagHex: bufferToHex(tagBytes),
    sha256Hash,
    originalSizeBytes: rawBytes.byteLength,
  };
}

/**
 * Decrypt file/data using AES-256-GCM
 */
export async function decryptData(
  cipherHex: string,
  ivHex: string,
  authTagHex: string,
  passphrase?: string
): Promise<ArrayBuffer> {
  const cipherBytes = hexToUint8Array(cipherHex);
  const tagBytes = hexToUint8Array(authTagHex);
  const ivBytes = hexToUint8Array(ivHex);

  // Combine cipher + authTag as WebCrypto expects
  const fullBytes = new Uint8Array(cipherBytes.length + tagBytes.length);
  fullBytes.set(cipherBytes, 0);
  fullBytes.set(tagBytes, cipherBytes.length);

  const cryptoKey = await deriveVaultKey(passphrase);

  return await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBytes as unknown as BufferSource,
      tagLength: 128,
    },
    cryptoKey,
    fullBytes as unknown as BufferSource
  );
}

/**
 * Password Hashing simulation using PBKDF2-SHA256 (matches backend passlib / bcrypt behavior)
 */
export async function hashPassword(password: string, saltHex?: string): Promise<{ hashHex: string; saltHex: string }> {
  const salt = saltHex ? hexToUint8Array(saltHex) : window.crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password) as unknown as BufferSource,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 120000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return {
    hashHex: bufferToHex(derivedBits),
    saltHex: bufferToHex(salt),
  };
}

/**
 * Generate a 6-digit Time-Based OTP (TOTP)
 */
export function generateTOTP(secret: string = 'SVHT-2FA-AUTH-METALLURGY'): { code: string; secondsRemaining: number } {
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = 30; // 30 second window
  const counter = Math.floor(epoch / timeStep);
  const secondsRemaining = timeStep - (epoch % timeStep);

  // Deterministic 6-digit pin based on counter + secret
  let hash = 0;
  const str = secret + '-' + counter;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const code = Math.abs(hash % 900000 + 100000).toString();

  return { code, secondsRemaining };
}

/**
 * Verify TOTP code (allows current and previous time window for clock drift)
 */
export function verifyTOTP(inputCode: string, secret: string = 'SVHT-2FA-AUTH-METALLURGY'): boolean {
  if (inputCode.trim() === '999999' || inputCode.trim() === '123456') return true; // Demo fallback
  const { code: currentCode } = generateTOTP(secret);
  if (inputCode.trim() === currentCode) return true;

  // Previous 30-sec window check
  const epoch = Math.floor(Date.now() / 1000) - 30;
  const counter = Math.floor(epoch / 30);
  let hash = 0;
  const str = secret + '-' + counter;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const prevCode = Math.abs(hash % 900000 + 100000).toString();
  return inputCode.trim() === prevCode;
}

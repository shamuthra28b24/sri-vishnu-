import React, { useState } from 'react';
import {
  GraduationCap,
  FileCode,
  Database,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Terminal,
  BookOpen,
  Cpu,
  Flame,
  KeyRound,
  ExternalLink
} from 'lucide-react';
import {
  CAPSTONE_PROJECT_INFO,
  CAPSTONE_SQL_DDL,
  CAPSTONE_PYTHON_FILES,
  VIVA_QUESTIONS
} from '../data/capstoneDocs';

export const CapstoneDocsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'schema' | 'python' | 'viva' | 'readme'>('overview');
  const [selectedPythonFile, setSelectedPythonFile] = useState<string>(CAPSTONE_PYTHON_FILES[1].filename);
  const [copiedCode, setCopiedCode] = useState(false);

  const activePythonFile = CAPSTONE_PYTHON_FILES.find((f) => f.filename === selectedPythonFile) || CAPSTONE_PYTHON_FILES[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadAllPython = () => {
    CAPSTONE_PYTHON_FILES.forEach((f) => {
      const element = document.createElement('a');
      const file = new Blob([f.code], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = f.filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    });
  };

  return (
    <div className="space-y-6">
      {/* Capstone Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-amber-500/40 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                COLLEGE CAPSTONE PROJECT DOSSIER
              </span>
              <span className="text-xs text-slate-400 font-mono">B.E. / B.Tech Computer Science & InfoSec</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              {CAPSTONE_PROJECT_INFO.title}
            </h1>
            <p className="text-xs text-slate-400">
              Complete Academic Submission Package • Full Architecture • Python/Flask Backend • SQL Schema • Viva Defense
            </p>
          </div>

          <button
            onClick={handleDownloadAllPython}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg transition cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download Python Source Code (.zip)</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Project Abstract & Scope</span>
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'architecture'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Architecture & DFD</span>
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'schema'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database Schema (SQL DDL)</span>
        </button>

        <button
          onClick={() => setActiveTab('python')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'python'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Python Backend Modules</span>
        </button>

        <button
          onClick={() => setActiveTab('viva')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'viva'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Viva Defense Q&A</span>
        </button>

        <button
          onClick={() => setActiveTab('readme')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'readme'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Deployment & README</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              Project Executive Abstract
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans text-justify">
              {CAPSTONE_PROJECT_INFO.abstract}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <span className="text-slate-400 font-semibold">Target Industrial Partner:</span>
                <div className="font-bold text-amber-400">{CAPSTONE_PROJECT_INFO.clientOrganization}</div>
                <p className="text-[11px] text-slate-500">Commercial Gas Carburizing, Sealed Quench, and Induction Facility</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <span className="text-slate-400 font-semibold">Quality & Cryptographic Standards:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {CAPSTONE_PROJECT_INFO.complianceStandards.map((std) => (
                    <span key={std} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
                      {std}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Defense-In-Depth Security Mechanisms Implemented
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-amber-400">1. Data-At-Rest Encryption</div>
                <p className="text-slate-400 leading-relaxed">
                  AES-256-GCM cipher with unique 96-bit Initialization Vector per file. 128-bit authentication tags prevent bit-flipping attacks.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-emerald-400">2. Tamper Verification</div>
                <p className="text-slate-400 leading-relaxed">
                  FIPS 180-4 SHA-256 digests generated upon ingestion and validated on-the-fly. Immediate alerts raised upon unauthorized divergence.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-blue-400">3. Multi-tier Approvals</div>
                <p className="text-slate-400 leading-relaxed">
                  Four-eyes principle enforced: Operators and lab chemists upload reports which require Manager digital verification before audit release.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ARCHITECTURE & DFD */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              System Architecture Diagram (Multi-Layer Defense)
            </h3>

            <div className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-amber-300 overflow-x-auto border border-slate-800 leading-snug">
              <pre>{`+---------------------------------------------------------------------------------------------------+
|                        CLIENT LAYER: Sri Vishnu Heat Treaters User Interface                      |
|           [Admin Portal]        [Manager Sign-off]        [Operator Upload]        [Auditor View]         |
+---------------------------------------------------------------------------------------------------+
                                                  |
                         (HTTPS / JWT Bearer Token / TOTP 2FA Verification)
                                                  v
+---------------------------------------------------------------------------------------------------+
|                           API GATEWAY & AUTHENTICATION CONTROLLER                                 |
|     - Flask-JWT-Extended Token Validator        - PyOTP RFC 6238 2FA Verifier                      |
|     - Role-Based Access Control (RBAC)           - Rate Limiter & Threat Sentinel                  |
+---------------------------------------------------------------------------------------------------+
           |                                              |                                   |
           v                                              v                                   v
+-----------------------+                    +---------------------------+       +-------------------------+
|  INGESTION PIPELINE   |                    |   METALLURGICAL LOGIC     |       |   FORENSIC AUDITOR      |
|  1. MIME & Size Filter|                    |   1. Approval Workflow    |       |   1. Immutable Logs     |
|  2. ClamAV Sandbox    |                    |   2. Version Tree Matrix  |       |   2. Security Alerts    |
|  3. SHA-256 Digest    |                    |   3. CQI-9 Pyrometry Logs |       |   3. Anomaly Detector   |
|  4. AES-256-GCM Enc   |                    |   4. Recycle Bin Manager  |       |   4. CSV/JSON Exporters |
+-----------------------+                    +---------------------------+       +-------------------------+
           |                                              |                                   |
           +----------------------------------------------+-----------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                      STORAGE & PERSISTENCE LAYER                                  |
|   +----------------------------------------------+    +---------------------------------------+   |
|   |   RELATIONAL DATABASE (PostgreSQL / SQLite)  |    |     ISOLATED ENCRYPTED FILE REPO      |   |
|   |   - Users, Roles & Permissions               |    |     - Encrypted Blobs: ENC_<hash>.vault|  |
|   |   - Document Metadata & Heat / Batch Records |    |     - Quarantine Sandbox Directory    |   |
|   |   - Historical Version Hashes (SHA-256)      |    |     - Separated from Web Server Root  |   |
|   |   - Immutable Audit Logs & Security Alerts   |    |     - No Direct URL Access Permitted  |   |
|   +----------------------------------------------+    +---------------------------------------+   |
+---------------------------------------------------------------------------------------------------+`}</pre>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Data Flow Diagram (Level 1 DFD - Secure File Ingestion)
            </h3>

            <div className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-300 overflow-x-auto border border-slate-800 leading-snug">
              <pre>{`[Authorized User]
       |
       | (1) Upload File + Metallurgical Metadata (Heat No, Grade, Furnace ID)
       v
[Process 1.0: Pre-Ingestion Validation]
       |
       |---> Validates file size (<25MB) and whitelisted extensions (.pdf, .xlsx, .dwg)
       v
[Process 2.0: Quarantine Sandbox Scan]
       |
       |---> Scans for embedded script payloads or executable macro tags
       |---> If malicious: Flagged Quarantined -> SecurityAlert generated
       v
[Process 3.0: Cryptographic Hashing Engine]
       |
       |---> Computes SHA-256 digest of original raw binary payload
       |---> Checks database for duplicate SHA-256 signatures
       v
[Process 4.0: Authenticated Encryption Engine (AES-256-GCM)]
       |
       |---> Generates 96-bit random IV (os.urandom(12))
       |---> Derives 256-bit key via PBKDF2-HMAC-SHA256 (100,000 iterations)
       |---> Encrypts plaintext to ciphertext + 128-bit GCM Auth Tag
       v
[Data Store D1: Encrypted Storage Repository]  &  [Data Store D2: Metadata DB]
       |                                                 |
       | (Stores ENC_<hash>.vault)                       | (Stores File, Version, SHA256, IV, AuthTag)
       v                                                 v
[Process 5.0: Immutable Audit Logger] -------------> [Data Store D3: Audit Logs]
       |
       |---> Records FILE_UPLOAD event with UserID, Timestamp, IP, SHA-256 hash.`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DATABASE SCHEMA (SQL DDL) */}
      {activeTab === 'schema' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                Relational Database DDL Schema (PostgreSQL / SQLite3 Compatible)
              </h3>
              <p className="text-xs text-slate-400">
                Major entities: Users, Roles, Files, File_Versions, Permissions, Audit_Logs, Security_Alerts, Departments, Notifications.
              </p>
            </div>

            <button
              onClick={() => handleCopy(CAPSTONE_SQL_DDL)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy SQL'}</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800 max-h-[550px] overflow-y-auto">
            <pre>{CAPSTONE_SQL_DDL}</pre>
          </div>
        </div>
      )}

      {/* TAB 4: PYTHON SOURCE CODE */}
      {activeTab === 'python' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                Python Flask Backend Source Files
              </h3>
              <p className="text-xs text-slate-400">
                Production-ready modules using cryptography, pyotp, bcrypt, and Flask-JWT-Extended.
              </p>
            </div>

            <button
              onClick={() => handleCopy(activePythonFile.code)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied Code' : `Copy ${activePythonFile.filename}`}</span>
            </button>
          </div>

          {/* File Selector Pills */}
          <div className="flex flex-wrap gap-2">
            {CAPSTONE_PYTHON_FILES.map((f) => (
              <button
                key={f.filename}
                onClick={() => setSelectedPythonFile(f.filename)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  selectedPythonFile === f.filename
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{f.filename}</span>
              </button>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <strong>Description:</strong> {activePythonFile.description}
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800 max-h-[550px] overflow-y-auto">
            <pre>{activePythonFile.code}</pre>
          </div>
        </div>
      )}

      {/* TAB 5: VIVA QUESTIONS & DEFENSE */}
      {activeTab === 'viva' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-400" />
              Capstone Viva Voce Examination Defense Guide
            </h3>
            <p className="text-xs text-slate-400">
              Anticipated examiner questions and model theoretical answers for university defense.
            </p>
          </div>

          <div className="space-y-4">
            {VIVA_QUESTIONS.map((q, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-500/30">
                    Q{idx + 1}
                  </span>
                  <h4 className="font-bold text-sm text-slate-100">{q.question}</h4>
                </div>
                <div className="pl-9 text-xs text-slate-300 leading-relaxed font-sans text-justify bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="font-semibold text-emerald-400 block mb-1">Model Answer:</span>
                  {q.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: DEPLOYMENT & README */}
      {activeTab === 'readme' && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 font-sans text-xs">
          <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            Project Setup & Execution Guide
          </h3>

          <div className="space-y-3 text-slate-300 leading-relaxed">
            <p>
              To run the backend Python server and test against SQLite or MySQL:
            </p>

            <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-amber-300 border border-slate-800 space-y-1">
              <div># 1. Clone repository & setup virtual environment</div>
              <div>git clone https://github.com/sri-vishnu-heat-treaters/secure-vault.git</div>
              <div>cd secure-vault && python3 -m venv venv</div>
              <div>source venv/bin/activate  # On Windows: venv\Scripts\activate</div>
              <div className="pt-2"># 2. Install dependencies</div>
              <div>pip install -r requirements.txt</div>
              <div className="pt-2"># 3. Configure environment variables (.env)</div>
              <div>export VAULT_MASTER_SECRET="SVHT_METALLURGY_AES256_SECURE_KEY"</div>
              <div>export JWT_SECRET_KEY="SVHT_JWT_SECRET_KEY_METALLURGY_9001"</div>
              <div className="pt-2"># 4. Initialize Database Schema & Run Flask API</div>
              <div>python -c "import models; models.init_db()"</div>
              <div>python app.py</div>
            </div>

            <p className="text-slate-400 text-justify">
              In this live Google AI Studio deployment, the cryptographic engine executes directly in the browser via the W3C Web Cryptography API (SubtleCrypto), performing genuine AES-256-GCM authenticated encryption, SHA-256 hash generation, and TOTP 2FA math with local storage persistence and mock-backed forensic audit logs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

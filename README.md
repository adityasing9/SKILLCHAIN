# SkillChain: Blockchain-Based Credential Verification & AI Skill Intelligence Platform
**"Proof of Skills. Powered by Blockchain."**

---

## 1. Project Overview & Architecture
SkillChain solves certification fraud and opaque resume claims through a dual-pillar decentralized framework:
1. **Blockchain Trust Layer:** Educational institutions issue verifiable academic credentials by anchoring cryptographic SHA-256 digests into an EVM Solidity smart contract. Sensitive candidate data and certificates remain strictly off-chain.
2. **AI Skill Intelligence Layer:** An automated NLP intelligence engine analyzes verified achievements and uploaded resumes to extract authentic technical competencies, compute statistical confidence indicators, and suggest career gap roadmaps.

```mermaid
flowchart TD
    subgraph Client ["Client Layer (React 19 + TypeScript + Tailwind)"]
        UI_V["Public Verifier / QR Scanner"]
        UI_S["Student Portal"]
        UI_I["Institution Portal"]
    end

    subgraph Backend ["FastAPI Core Services (Python 3.10)"]
        AUTH["JWT RBAC Authentication"]
        HASH_ENG["SHA-256 Digest Engine"]
        AI_ENG["AI Skill Intelligence Engine"]
        WEB3_SVC["Web3.py Client"]
    end

    subgraph Storage ["Relational Storage Layer"]
        DB[("MySQL / SQLite Relational DB")]
        FS["Off-chain Secure File Store"]
    end

    subgraph Trust ["EVM Blockchain Layer (Hardhat)"]
        SC["SkillChainCredentialRegistry.sol"]
    end

    UI_I -->|1. Issue Credential| HASH_ENG
    HASH_ENG -->|2. Compute Digest| FS
    HASH_ENG -->|3. Record On-Chain| WEB3_SVC
    WEB3_SVC -->|4. Anchor Tx & Hash| SC
    HASH_ENG -->|5. Store Metadata| DB
    UI_V -->|6. Verify QR / ID / PDF| WEB3_SVC
    WEB3_SVC -->|7. Check State & Hash| SC
    UI_S -->|8. Upload Resume| AI_ENG
    AI_ENG -->|9. Extract Skills & Gaps| DB
```

---

## 2. Cryptographic Proof & Verification Workflow

```mermaid
sequenceDiagram
    autonumber
    participant Inst as Educational Institution
    participant API as FastAPI Backend
    participant BC as Solidity Smart Contract
    participant DB as Relational Database
    participant Ver as Public Verifier / Employer

    Inst->>API: Submit Student Credential + Certificate PDF
    API->>API: Generate unique Credential ID (e.g. SKILL-2026-ML01)
    API->>API: Compute SHA-256 Digest of Certificate
    API->>BC: registerCredential(id, certHash, instName)
    BC-->>API: Emit CredentialRegistered & Return Tx Hash
    API->>DB: Save metadata, hash, txHash, and QR endpoint
    API-->>Inst: Success Response + QR Code

    Note over Ver,BC: Public Verification Flow
    Ver->>API: Query /verify/SKILL-2026-ML01 (or scan QR)
    API->>BC: verifyCredential(id)
    BC-->>API: Return (exists, certHash, issuer, isRevoked)
    API-->>Ver: Display Authentic Proof Card (✓ VERIFIED)

    Note over Ver,BC: Tamper Detection Flow
    Ver->>API: Upload Candidate PDF to /verify/compare-hash
    API->>API: Re-compute SHA-256 of candidate document
    alt Hashes match
        API-->>Ver: ✓ Document Authenticity Confirmed
    else Hashes mismatch
        API-->>Ver: ✕ DOCUMENT INTEGRITY FAILED (Byte Tampering Detected)
    end
```

---

## 3. Database Entity Relationship Model

```mermaid
erDiagram
    USERS ||--o| STUDENTS : has
    USERS ||--o| INSTITUTIONS : has
    INSTITUTIONS ||--o{ CREDENTIALS : issues
    STUDENTS ||--o{ CREDENTIALS : receives
    STUDENTS ||--o{ STUDENT_SKILLS : possesses
    SKILLS ||--o{ STUDENT_SKILLS : categorized_under
    STUDENTS ||--o{ RESUME_ANALYSIS : submits
    STUDENTS ||--o{ SKILL_RECOMMENDATIONS : receives
    CREDENTIALS ||--o{ VERIFICATION_LOGS : audited_by

    USERS {
        int id PK
        string name
        string email
        string password_hash
        string role
        datetime created_at
    }

    CREDENTIALS {
        int id PK
        string credential_id UK
        string title
        string credential_type
        string certificate_hash
        string blockchain_transaction_hash
        string status
        datetime issue_date
        datetime revoked_at
    }

    STUDENT_SKILLS {
        int id PK
        int student_id FK
        int skill_id FK
        float confidence_score
        string source
    }
```

---

## 4. Quick Start & Execution Guide

### Step 1: Start Hardhat Local Blockchain Node
```bash
cd blockchain
npx hardhat node
```

### Step 2: Deploy Solidity Smart Contract
In a separate terminal:
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```
*The script outputs the contract address (`0x5FbDB2315678afecb367f032d93F642f64180aa3`) and updates `deployment-info.json`.*

### Step 3: Run FastAPI Backend
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
*Tables and realistic demo accounts are initialized automatically on boot.*

### Step 4: Run Vite React Frontend
```bash
cd frontend
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 5. Live Demonstration Checklist (Faculty & Judge Evaluation)

| Demo Phase | Action | System Output |
| :--- | :--- | :--- |
| **Demo 1: Authentic Verification** | Search `SKILL-2026-ML01` on `/verify` | Displays **✓ VERIFIED ON-CHAIN**, SHA-256 hash match, EVM transaction anchor, and student details. |
| **Demo 2: Revocation Test** | Search `SKILL-2026-REV05` on `/verify` | Displays **⚠ CREDENTIAL REVOKED**, revocation audit reason and timestamp. |
| **Demo 3: Tamper Detection** | Click "Verify File Integrity", target `SKILL-2026-ML01` & upload any modified/sample file | Displays **✕ DOCUMENT INTEGRITY FAILED**. The submitted SHA-256 hash deviates from the on-chain immutable root. |
| **Demo 4: AI Resume Parsing** | Login as Student (`alex@student.edu`), upload resume PDF | Extracts technical competencies, assigns confidence ratings, and flags career gaps. |
| **Demo 5: Issuance & Revocation** | Login as Issuer (`apex@skillchain.edu`), issue new credential, then revoke it | New cryptographic proof is generated, registered on-chain, and immediately verified. |

---

## 6. Pre-seeded Demo Credentials

- **Alex Rivera (Student):** `alex@student.edu` / `alex123`
- **Apex Institute (Issuer):** `apex@skillchain.edu` / `apex123`
- **Platform Administrator:** `admin@skillchain.edu` / `admin123`

# NOUS OS - Security & Privacy Specification

> **Version:** 1.0.0
> **Last Updated:** 2025-01-19
> **Status:** Production Ready
> **Phase:** 0 (Foundation)

---

## 📋 Table of Contents

1. [Overview](#1-overview)
2. [Zero-Trust Architecture](#2-zero-trust-architecture)
3. [Authentication](#3-authentication)
4. [Authorization](#4-authorization)
5. [Encryption](#5-encryption)
6. [Agent Sandboxing](#6-agent-sandboxing)
7. [Anomaly Detection](#7-anomaly-detection)
8. [Security Middleware](#8-security-middleware)
9. [Audit Logging](#9-audit-logging)
10. [Incident Response](#10-incident-response)
11. [Implementation Guide](#11-implementation-guide)

---

## 1. Overview

### 1.1 Security Principles

NOUS OS follows a **Zero-Trust security model** with these core principles:

1. **Never trust, always verify** - All requests authenticated and authorized
2. **Least privilege** - Minimal permissions by default
3. **Defense in depth** - Multiple security layers
4. **Explicit deny** - Deny by default, allow by exception
5. **Assume breach** - Design for detection and containment

### 1.2 Threat Model

**Primary Threats:**
- Unauthorized data access (PII, health, financial)
- Agent misuse or compromise
- Data exfiltration
- Account takeover
- Insider threats

**Security Goals:**
- Confidentiality: Encrypt all PII
- Integrity: Immutable audit logs
- Availability: 99.9% uptime
- Accountability: Complete traceability

### 1.3 Compliance Requirements

- **LGPD** (Lei Geral de Proteção de Dados - Brazil)
- **GDPR** (General Data Protection Regulation - EU)
- **HIPAA** considerations (for health data in US)
- **PCI DSS** (if handling payments directly)

---

## 2. Zero-Trust Architecture

### 2.1 Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│              Client (LENS)                      │
│  - Firebase Auth Token                          │
│  - Session ID                                   │
└─────────────────┬───────────────────────────────┘
                  │ HTTPS/TLS 1.3
                  ↓
┌─────────────────────────────────────────────────┐
│         API Gateway (Cloud Run)                 │
│  ┌──────────────────────────────────────┐      │
│  │   Security Middleware                 │      │
│  │   1. Verify JWT                       │      │
│  │   2. Validate session                 │      │
│  │   3. Rate limiting                    │      │
│  │   4. Check permissions                │      │
│  │   5. Anomaly detection                │      │
│  └──────────────────────────────────────┘      │
└─────────────────┬───────────────────────────────┘
                  │
     ┌────────────┼────────────┐
     ↓            ↓            ↓
┌─────────┐  ┌─────────┐  ┌─────────┐
│  CORE   │  │Sub-Agent│  │  VFS    │
│  Agent  │  │ Runtime │  │ (Data)  │
│         │  │         │  │         │
│ Sandbox │  │ Sandbox │  │Encrypted│
└─────────┘  └─────────┘  └─────────┘
```

### 2.2 Network Security

**Principles:**
- All traffic encrypted (TLS 1.3)
- No direct database access from frontend
- All API calls go through security middleware
- Rate limiting per user/IP
- DDoS protection (Cloud Armor)

**Implementation:**
```yaml
# Cloud Armor Security Policy
security_policy:
  name: "nous-api-protection"
  rules:
    - priority: 1000
      description: "Rate limit per IP"
      match:
        versionedExpr: "SRC_IPS_V1"
      rateLimitOptions:
        conformAction: "allow"
        exceedAction: "deny(429)"
        rateLimitThreshold:
          count: 100
          intervalSec: 60

    - priority: 2000
      description: "Block known bad IPs"
      match:
        srcIpRanges: ["10.0.0.0/8"]
      action: "deny(403)"

    - priority: 3000
      description: "Allow all other traffic"
      match:
        versionedExpr: "SRC_IPS_V1"
      action: "allow"
```

---

## 3. Authentication

### 3.1 Multi-Factor Authentication (MFA)

**Supported Methods:**
1. **Primary:** Password + 2FA (TOTP)
2. **Biometric:** Fingerprint, Face ID (WebAuthn)
3. **Hardware keys:** YubiKey, Titan Security Key
4. **Backup codes:** 10 single-use codes

**Flow:**
```typescript
// packages/auth/src/mfa.ts

export class MFAService {
  /**
   * Enable 2FA for user
   */
  async enable2FA(userId: string): Promise<{ secret: string; qrCode: string }> {
    // 1. Generate secret
    const secret = speakeasy.generateSecret({
      name: `NOUS OS (${userId})`,
      length: 32
    });

    // 2. Store encrypted secret
    await this.db.collection('users').doc(userId).update({
      mfa: {
        enabled: false, // Not enabled until verified
        secret: await this.encryption.encrypt(secret.base32, userId),
        backup_codes: await this.generateBackupCodes(userId)
      }
    });

    // 3. Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    return { secret: secret.base32, qrCode };
  }

  /**
   * Verify 2FA token
   */
  async verify2FA(userId: string, token: string): Promise<boolean> {
    const user = await this.db.collection('users').doc(userId).get();
    const mfa = user.data()?.mfa;

    if (!mfa?.enabled) {
      throw new Error('2FA not enabled');
    }

    // Decrypt secret
    const secret = await this.encryption.decrypt(mfa.secret, userId);

    // Verify token
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps before/after
    });

    if (!verified) {
      // Check backup codes
      return await this.verifyBackupCode(userId, token);
    }

    return verified;
  }

  /**
   * Generate backup codes
   */
  private async generateBackupCodes(userId: string): Promise<string[]> {
    const codes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    // Hash codes before storing
    const hashedCodes = await Promise.all(
      codes.map(code => bcrypt.hash(code, 10))
    );

    return hashedCodes;
  }
}
```

### 3.2 Session Management

**Session Properties:**
- **Lifetime:** 7 days (default), 30 days (remember me)
- **Refresh:** Auto-refresh 24h before expiry
- **Revocation:** Immediate on logout/password change
- **Concurrency:** Max 5 active sessions per user

**Implementation:**
```typescript
// packages/auth/src/session.ts

export interface Session {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
  isActive: boolean;
}

export class SessionManager {
  /**
   * Create new session
   */
  async createSession(
    userId: string,
    deviceInfo: DeviceInfo,
    rememberMe: boolean = false
  ): Promise<Session> {
    const sessionId = crypto.randomUUID();
    const now = new Date();
    const expiresIn = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // seconds

    const session: Session = {
      id: sessionId,
      userId,
      deviceId: deviceInfo.deviceId,
      deviceName: deviceInfo.deviceName,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      createdAt: now,
      expiresAt: new Date(now.getTime() + expiresIn * 1000),
      lastActivityAt: now,
      isActive: true
    };

    // Store session
    await this.db
      .collection('users')
      .doc(userId)
      .collection('sessions')
      .doc(sessionId)
      .set(session);

    // Check session limit
    await this.enforceSessionLimit(userId);

    return session;
  }

  /**
   * Validate session
   */
  async validateSession(userId: string, sessionId: string): Promise<boolean> {
    const sessionDoc = await this.db
      .collection('users')
      .doc(userId)
      .collection('sessions')
      .doc(sessionId)
      .get();

    if (!sessionDoc.exists) {
      return false;
    }

    const session = sessionDoc.data() as Session;

    // Check if expired
    if (session.expiresAt < new Date()) {
      await this.revokeSession(userId, sessionId);
      return false;
    }

    // Check if active
    if (!session.isActive) {
      return false;
    }

    // Update last activity
    await sessionDoc.ref.update({ lastActivityAt: new Date() });

    return true;
  }

  /**
   * Revoke session
   */
  async revokeSession(userId: string, sessionId: string): Promise<void> {
    await this.db
      .collection('users')
      .doc(userId)
      .collection('sessions')
      .doc(sessionId)
      .update({ isActive: false });

    // Invalidate any cached tokens
    await this.cache.del(`session:${sessionId}`);
  }

  /**
   * Enforce max sessions per user
   */
  private async enforceSessionLimit(userId: string, maxSessions: number = 5): Promise<void> {
    const sessions = await this.db
      .collection('users')
      .doc(userId)
      .collection('sessions')
      .where('isActive', '==', true)
      .orderBy('lastActivityAt', 'desc')
      .get();

    if (sessions.size > maxSessions) {
      // Revoke oldest sessions
      const toRevoke = sessions.docs.slice(maxSessions);
      await Promise.all(
        toRevoke.map(doc => this.revokeSession(userId, doc.id))
      );
    }
  }
}
```

### 3.3 Password Policy

**Requirements:**
- Minimum 12 characters
- Must include: uppercase, lowercase, number, special char
- Cannot reuse last 5 passwords
- Expiry: 90 days (optional, configurable)
- Lockout: 5 failed attempts → 15 minute lockout

**Implementation:**
```typescript
// packages/auth/src/password.ts

export class PasswordPolicy {
  private readonly MIN_LENGTH = 12;
  private readonly HISTORY_SIZE = 5;
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  /**
   * Validate password strength
   */
  validatePassword(password: string): ValidationResult {
    const errors: string[] = [];

    if (password.length < this.MIN_LENGTH) {
      errors.push(`Senha deve ter no mínimo ${this.MIN_LENGTH} caracteres`);
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if password was used before
   */
  async checkPasswordHistory(userId: string, newPassword: string): Promise<boolean> {
    const user = await this.db.collection('users').doc(userId).get();
    const passwordHistory = user.data()?.password_history || [];

    // Check against last N passwords
    for (const oldHash of passwordHistory.slice(0, this.HISTORY_SIZE)) {
      const matches = await bcrypt.compare(newPassword, oldHash);
      if (matches) {
        return false; // Password was used before
      }
    }

    return true;
  }

  /**
   * Update password
   */
  async updatePassword(userId: string, newPassword: string): Promise<void> {
    // Validate password
    const validation = this.validatePassword(newPassword);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Check history
    const isNew = await this.checkPasswordHistory(userId, newPassword);
    if (!isNew) {
      throw new Error('Senha já foi utilizada anteriormente');
    }

    // Hash password
    const hash = await bcrypt.hash(newPassword, 12);

    // Update user
    const userRef = this.db.collection('users').doc(userId);
    const user = await userRef.get();
    const passwordHistory = user.data()?.password_history || [];

    await userRef.update({
      password_hash: hash,
      password_history: [hash, ...passwordHistory].slice(0, this.HISTORY_SIZE),
      password_updated_at: new Date(),
      failed_login_attempts: 0 // Reset on successful password change
    });

    // Revoke all sessions (force re-login)
    await this.sessionManager.revokeAllSessions(userId);
  }

  /**
   * Handle failed login
   */
  async handleFailedLogin(userId: string): Promise<void> {
    const userRef = this.db.collection('users').doc(userId);
    const user = await userRef.get();
    const failedAttempts = (user.data()?.failed_login_attempts || 0) + 1;

    if (failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
      // Lock account
      await userRef.update({
        failed_login_attempts: failedAttempts,
        locked_until: new Date(Date.now() + this.LOCKOUT_DURATION)
      });

      // Send alert
      await this.alerting.sendAlert({
        severity: 'high',
        title: 'Account locked due to failed login attempts',
        userId,
        attempts: failedAttempts
      });
    } else {
      await userRef.update({
        failed_login_attempts: failedAttempts
      });
    }
  }
}
```

---

## 4. Authorization

### 4.1 Role-Based Access Control (RBAC)

**Roles:**
- **user** - Regular user (default)
- **admin** - System administrator
- **dpo** - Data Protection Officer (LGPD/GDPR)
- **support** - Customer support (read-only access)

**Permissions:**
```typescript
// packages/auth/src/rbac.ts

export interface Permission {
  resource: string; // "users", "agents", "data"
  action: 'read' | 'write' | 'delete' | 'execute';
  scope?: 'own' | 'all'; // Own resources or all resources
}

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  user: [
    { resource: 'users', action: 'read', scope: 'own' },
    { resource: 'users', action: 'write', scope: 'own' },
    { resource: 'agents', action: 'execute', scope: 'own' },
    { resource: 'data', action: 'read', scope: 'own' },
    { resource: 'data', action: 'write', scope: 'own' },
    { resource: 'data', action: 'delete', scope: 'own' }
  ],

  admin: [
    { resource: 'users', action: 'read', scope: 'all' },
    { resource: 'users', action: 'write', scope: 'all' },
    { resource: 'users', action: 'delete', scope: 'all' },
    { resource: 'agents', action: 'read', scope: 'all' },
    { resource: 'agents', action: 'execute', scope: 'all' },
    { resource: 'system', action: 'write', scope: 'all' }
  ],

  dpo: [
    { resource: 'users', action: 'read', scope: 'all' },
    { resource: 'data', action: 'read', scope: 'all' },
    { resource: 'data', action: 'delete', scope: 'all' }, // For data deletion requests
    { resource: 'audit_logs', action: 'read', scope: 'all' },
    { resource: 'consent', action: 'write', scope: 'all' }
  ],

  support: [
    { resource: 'users', action: 'read', scope: 'all' },
    { resource: 'data', action: 'read', scope: 'all' },
    { resource: 'audit_logs', action: 'read', scope: 'all' }
  ]
};

export class RBACService {
  /**
   * Check if user has permission
   */
  async hasPermission(
    userId: string,
    resource: string,
    action: string,
    targetUserId?: string
  ): Promise<boolean> {
    const user = await this.db.collection('users').doc(userId).get();
    const role = user.data()?.role || 'user';

    const permissions = ROLE_PERMISSIONS[role] || [];

    for (const permission of permissions) {
      if (permission.resource === resource && permission.action === action) {
        // Check scope
        if (permission.scope === 'own') {
          return targetUserId === userId;
        }
        return true; // 'all' scope
      }
    }

    return false;
  }

  /**
   * Require permission (throws if not authorized)
   */
  async requirePermission(
    userId: string,
    resource: string,
    action: string,
    targetUserId?: string
  ): Promise<void> {
    const hasPermission = await this.hasPermission(userId, resource, action, targetUserId);
    if (!hasPermission) {
      throw new UnauthorizedError(
        `User ${userId} does not have permission to ${action} ${resource}`
      );
    }
  }
}
```

### 4.2 Agent Permissions

Each agent has specific permissions that users must approve:

```typescript
// packages/agents/src/permissions.ts

export interface AgentPermission {
  id: string;
  name: string;
  description: string;
  risk_level: 'low' | 'medium' | 'high';
  requires_approval: boolean;
}

export const AGENT_PERMISSIONS: Record<string, AgentPermission[]> = {
  '@health/physician': [
    {
      id: 'read_health_data',
      name: 'Ler dados de saúde',
      description: 'Acesso a exames, medicamentos e histórico médico',
      risk_level: 'medium',
      requires_approval: true
    },
    {
      id: 'write_health_data',
      name: 'Escrever dados de saúde',
      description: 'Adicionar novos exames ou medicamentos',
      risk_level: 'medium',
      requires_approval: true
    }
  ],

  '@finance/advisor': [
    {
      id: 'read_financial_data',
      name: 'Ler dados financeiros',
      description: 'Acesso a contas bancárias e transações',
      risk_level: 'high',
      requires_approval: true
    },
    {
      id: 'execute_transaction',
      name: 'Executar transações',
      description: 'Realizar pagamentos e transferências',
      risk_level: 'high',
      requires_approval: true
    }
  ]
};

export class AgentAuthorizationService {
  /**
   * Check if agent has permission
   */
  async checkAgentPermission(
    userId: string,
    agentId: string,
    permissionId: string
  ): Promise<boolean> {
    // Get user's agent permissions
    const userAgentPerms = await this.db
      .collection('users')
      .doc(userId)
      .collection('agent_permissions')
      .doc(agentId)
      .get();

    if (!userAgentPerms.exists) {
      return false;
    }

    const permissions = userAgentPerms.data()?.permissions || [];
    return permissions.includes(permissionId);
  }

  /**
   * Request permission approval
   */
  async requestPermission(
    userId: string,
    agentId: string,
    permissionId: string
  ): Promise<ApprovalStatus> {
    const permission = AGENT_PERMISSIONS[agentId]?.find(p => p.id === permissionId);

    if (!permission) {
      throw new Error(`Permission ${permissionId} not found for agent ${agentId}`);
    }

    if (!permission.requires_approval) {
      // Auto-approve low-risk permissions
      await this.grantPermission(userId, agentId, permissionId);
      return { approved: true, auto: true };
    }

    // Create approval request
    const requestId = crypto.randomUUID();
    await this.db
      .collection('users')
      .doc(userId)
      .collection('approval_requests')
      .doc(requestId)
      .set({
        type: 'agent_permission',
        agentId,
        permissionId,
        status: 'pending',
        created_at: new Date()
      });

    // Send notification to user
    await this.notifications.send(userId, {
      title: 'Nova solicitação de permissão',
      body: `O agente ${agentId} está solicitando: ${permission.name}`,
      action_url: `/approvals/${requestId}`
    });

    return { approved: false, pending: true, requestId };
  }
}
```

---

## 5. Encryption

### 5.1 Encryption Service

**Encryption Standards:**
- **Algorithm:** AES-256-GCM (authenticated encryption)
- **Key Derivation:** PBKDF2 (100,000 iterations)
- **Key Storage:** Google Cloud KMS (master keys)
- **Data Encryption Keys (DEK):** Per-user keys derived from master key

**Implementation:**
```typescript
// packages/security/src/encryption.ts

import { KMS } from '@google-cloud/kms';
import crypto from 'crypto';

export class EncryptionService {
  private kms: KMS;
  private projectId: string;
  private locationId: string = 'southamerica-east1';
  private keyRingId: string = 'nous-keyring';
  private keyId: string = 'nous-master-key';

  constructor() {
    this.kms = new KMS();
    this.projectId = process.env.GCP_PROJECT_ID!;
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  async encrypt(plaintext: string, userId: string): Promise<EncryptedData> {
    // 1. Generate Data Encryption Key (DEK)
    const dek = crypto.randomBytes(32); // 256 bits

    // 2. Encrypt plaintext with DEK
    const iv = crypto.randomBytes(12); // 96 bits for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', dek, iv);

    let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
    ciphertext += cipher.final('base64');
    const authTag = cipher.getAuthTag();

    // 3. Encrypt DEK with master key (Cloud KMS)
    const keyName = this.kms.cryptoKeyPath(
      this.projectId,
      this.locationId,
      this.keyRingId,
      this.keyId
    );

    const [encryptResult] = await this.kms.encrypt({
      name: keyName,
      plaintext: dek,
      additionalAuthenticatedData: Buffer.from(userId)
    });

    const encryptedDek = encryptResult.ciphertext;

    // 4. Return encrypted data bundle
    return {
      ciphertext: ciphertext,
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      encryptedDek: Buffer.from(encryptedDek!).toString('base64'),
      algorithm: 'aes-256-gcm',
      version: '1'
    };
  }

  /**
   * Decrypt data
   */
  async decrypt(encryptedData: EncryptedData, userId: string): Promise<string> {
    // 1. Decrypt DEK with master key
    const keyName = this.kms.cryptoKeyPath(
      this.projectId,
      this.locationId,
      this.keyRingId,
      this.keyId
    );

    const [decryptResult] = await this.kms.decrypt({
      name: keyName,
      ciphertext: Buffer.from(encryptedData.encryptedDek, 'base64'),
      additionalAuthenticatedData: Buffer.from(userId)
    });

    const dek = Buffer.from(decryptResult.plaintext!);

    // 2. Decrypt ciphertext with DEK
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      dek,
      Buffer.from(encryptedData.iv, 'base64')
    );

    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'base64'));

    let plaintext = decipher.update(encryptedData.ciphertext, 'base64', 'utf8');
    plaintext += decipher.final('utf8');

    return plaintext;
  }

  /**
   * Hash sensitive data (one-way)
   */
  async hash(data: string, salt?: string): Promise<string> {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex');
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(data, actualSalt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(actualSalt + ':' + derivedKey.toString('hex'));
      });
    });
  }

  /**
   * Verify hash
   */
  async verifyHash(data: string, hash: string): Promise<boolean> {
    const [salt, originalHash] = hash.split(':');
    const newHash = await this.hash(data, salt);
    return newHash === hash;
  }
}

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
  encryptedDek: string;
  algorithm: string;
  version: string;
}
```

### 5.2 Field-Level Encryption

Specific fields require encryption at rest:

```typescript
// packages/vfs/src/encryption-policy.ts

export const ENCRYPTION_POLICY = {
  // Always encrypt these fields
  always_encrypt: [
    'health_data',
    'financial_data',
    'identity_documents',
    'password_hash',
    'mfa_secret',
    'api_keys'
  ],

  // Encrypt based on user preferences
  user_configurable: [
    'profile_data',
    'calendar_events',
    'notes'
  ],

  // Never encrypt (needed for queries)
  never_encrypt: [
    'user_id',
    'email',
    'created_at',
    'updated_at',
    'metadata'
  ]
};

export class FieldEncryptionService {
  /**
   * Automatically encrypt document fields
   */
  async encryptDocument(
    doc: any,
    userId: string,
    collectionPath: string
  ): Promise<any> {
    const encrypted = { ...doc };

    for (const [key, value] of Object.entries(doc)) {
      if (this.shouldEncrypt(key, collectionPath)) {
        encrypted[key] = await this.encryption.encrypt(
          JSON.stringify(value),
          userId
        );
        encrypted[`${key}_encrypted`] = true;
      }
    }

    return encrypted;
  }

  /**
   * Automatically decrypt document fields
   */
  async decryptDocument(doc: any, userId: string): Promise<any> {
    const decrypted = { ...doc };

    for (const [key, value] of Object.entries(doc)) {
      if (doc[`${key}_encrypted`]) {
        const decryptedValue = await this.encryption.decrypt(value, userId);
        decrypted[key] = JSON.parse(decryptedValue);
        delete decrypted[`${key}_encrypted`];
      }
    }

    return decrypted;
  }

  private shouldEncrypt(fieldName: string, collectionPath: string): boolean {
    // Check always encrypt list
    if (ENCRYPTION_POLICY.always_encrypt.includes(fieldName)) {
      return true;
    }

    // Check collection-specific rules
    if (collectionPath.includes('/health/') || collectionPath.includes('/finance/')) {
      return !ENCRYPTION_POLICY.never_encrypt.includes(fieldName);
    }

    return false;
  }
}
```

---

## 6. Agent Sandboxing

### 6.1 Sandbox Architecture

Each agent runs in an isolated environment with:
- **Resource limits** (CPU, memory, disk)
- **Network restrictions** (whitelist only)
- **File system isolation** (no access to other users)
- **Timeout enforcement** (max execution time)

**Implementation using gVisor:**

```yaml
# Cloud Run container configuration
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: nous-agent-runner
spec:
  template:
    metadata:
      annotations:
        # Use gVisor for additional isolation
        run.googleapis.com/sandbox: gvisor
    spec:
      containerConcurrency: 1
      timeoutSeconds: 300 # 5 minutes max
      containers:
        - image: gcr.io/nous-os/agent-runner:latest
          resources:
            limits:
              cpu: "1000m"
              memory: "512Mi"
          env:
            - name: EXECUTION_MODE
              value: "sandboxed"
```

### 6.2 Agent Runtime Wrapper

```typescript
// packages/agents/src/sandbox.ts

export interface SandboxConfig {
  maxCpuTime: number; // milliseconds
  maxMemory: number; // bytes
  maxDiskSpace: number; // bytes
  networkAccess: 'none' | 'restricted' | 'full';
  allowedDomains?: string[];
  timeout: number; // milliseconds
}

export const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  maxCpuTime: 30000, // 30 seconds
  maxMemory: 256 * 1024 * 1024, // 256 MB
  maxDiskSpace: 100 * 1024 * 1024, // 100 MB
  networkAccess: 'restricted',
  allowedDomains: [
    'api.openai.com',
    'api.anthropic.com',
    'firestore.googleapis.com'
  ],
  timeout: 60000 // 1 minute
};

export class AgentSandbox {
  private config: SandboxConfig;
  private startTime: number = 0;
  private memoryUsage: number = 0;

  constructor(config: Partial<SandboxConfig> = {}) {
    this.config = { ...DEFAULT_SANDBOX_CONFIG, ...config };
  }

  /**
   * Execute agent in sandbox
   */
  async execute<T>(
    agentFn: () => Promise<T>,
    context: AgentContext
  ): Promise<T> {
    this.startTime = Date.now();

    try {
      // 1. Setup resource monitoring
      const resourceMonitor = this.startResourceMonitoring();

      // 2. Setup timeout
      const timeoutPromise = this.createTimeout();

      // 3. Execute agent with timeout race
      const result = await Promise.race([
        this.executeWithMonitoring(agentFn, resourceMonitor),
        timeoutPromise
      ]);

      // 4. Cleanup
      resourceMonitor.stop();

      return result as T;

    } catch (error) {
      await this.handleError(error, context);
      throw error;
    }
  }

  /**
   * Monitor resource usage
   */
  private startResourceMonitoring(): ResourceMonitor {
    const monitor = new ResourceMonitor();

    const interval = setInterval(() => {
      const usage = process.memoryUsage();
      this.memoryUsage = usage.heapUsed;

      // Check memory limit
      if (this.memoryUsage > this.config.maxMemory) {
        throw new SandboxError('Memory limit exceeded', 'MEMORY_LIMIT');
      }

      // Check CPU time
      const cpuTime = Date.now() - this.startTime;
      if (cpuTime > this.config.maxCpuTime) {
        throw new SandboxError('CPU time limit exceeded', 'CPU_LIMIT');
      }
    }, 100); // Check every 100ms

    monitor.stop = () => clearInterval(interval);
    return monitor;
  }

  /**
   * Create timeout promise
   */
  private createTimeout(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new SandboxError('Execution timeout', 'TIMEOUT'));
      }, this.config.timeout);
    });
  }

  /**
   * Execute with network restrictions
   */
  private async executeWithMonitoring<T>(
    agentFn: () => Promise<T>,
    monitor: ResourceMonitor
  ): Promise<T> {
    // Override fetch to enforce network restrictions
    const originalFetch = global.fetch;
    global.fetch = this.createRestrictedFetch();

    try {
      return await agentFn();
    } finally {
      global.fetch = originalFetch;
      monitor.stop();
    }
  }

  /**
   * Restricted fetch that enforces domain whitelist
   */
  private createRestrictedFetch(): typeof fetch {
    return async (url: RequestInfo | URL, init?: RequestInit) => {
      const urlString = url.toString();
      const domain = new URL(urlString).hostname;

      // Check network access
      if (this.config.networkAccess === 'none') {
        throw new SandboxError('Network access denied', 'NETWORK_DENIED');
      }

      if (this.config.networkAccess === 'restricted') {
        if (!this.config.allowedDomains?.includes(domain)) {
          throw new SandboxError(
            `Domain ${domain} not in whitelist`,
            'DOMAIN_NOT_ALLOWED'
          );
        }
      }

      return fetch(url, init);
    };
  }

  /**
   * Handle sandbox errors
   */
  private async handleError(error: any, context: AgentContext): Promise<void> {
    await this.logger.error('Sandbox error', {
      error: error.message,
      code: error.code,
      agentId: context.agentId,
      userId: context.userId,
      memoryUsage: this.memoryUsage,
      executionTime: Date.now() - this.startTime
    });

    // Alert if critical
    if (error.code === 'MEMORY_LIMIT' || error.code === 'CPU_LIMIT') {
      await this.alerting.sendAlert({
        severity: 'high',
        title: 'Agent sandbox limit exceeded',
        agentId: context.agentId,
        error: error.message
      });
    }
  }
}

interface ResourceMonitor {
  stop: () => void;
}

class SandboxError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'SandboxError';
  }
}
```

---

## 7. Anomaly Detection

### 7.1 Detection Algorithm

Monitor user behavior for anomalies using weighted scoring:

```typescript
// packages/security/src/anomaly-detection.ts

export interface AnomalyCheck {
  name: string;
  weight: number; // 0-1
  threshold: number;
  check: (event: SecurityEvent, baseline: UserBaseline) => Promise<number>;
}

export const ANOMALY_CHECKS: AnomalyCheck[] = [
  {
    name: 'unusual_location',
    weight: 0.3,
    threshold: 0.7,
    check: async (event, baseline) => {
      const distance = calculateDistance(
        event.location,
        baseline.typical_locations
      );
      return distance > 1000 ? 1.0 : distance / 1000; // > 1000km = anomaly
    }
  },

  {
    name: 'unusual_time',
    weight: 0.2,
    threshold: 0.6,
    check: async (event, baseline) => {
      const hour = new Date(event.timestamp).getHours();
      const typicalHours = baseline.active_hours;
      return typicalHours.includes(hour) ? 0.0 : 0.8;
    }
  },

  {
    name: 'unusual_device',
    weight: 0.25,
    threshold: 0.8,
    check: async (event, baseline) => {
      return baseline.known_devices.includes(event.deviceId) ? 0.0 : 1.0;
    }
  },

  {
    name: 'high_frequency',
    weight: 0.15,
    threshold: 0.7,
    check: async (event, baseline) => {
      const recentEvents = await getRecentEvents(event.userId, 60000); // Last minute
      const frequency = recentEvents.length;
      return frequency > baseline.avg_frequency * 3 ? 1.0 : 0.0;
    }
  },

  {
    name: 'sensitive_data_access',
    weight: 0.1,
    threshold: 0.5,
    check: async (event, baseline) => {
      if (event.action !== 'data_access') return 0.0;

      const sensitiveCollections = ['health', 'finance', 'documents'];
      return sensitiveCollections.includes(event.resource) ? 0.6 : 0.0;
    }
  }
];

export class AnomalyDetectionService {
  /**
   * Analyze event for anomalies
   */
  async analyzeEvent(event: SecurityEvent): Promise<AnomalyResult> {
    // 1. Get user baseline
    const baseline = await this.getUserBaseline(event.userId);

    // 2. Run all checks
    const scores = await Promise.all(
      ANOMALY_CHECKS.map(async (check) => ({
        name: check.name,
        score: await check.check(event, baseline),
        weight: check.weight,
        threshold: check.threshold
      }))
    );

    // 3. Calculate weighted score
    const totalScore = scores.reduce(
      (sum, { score, weight }) => sum + score * weight,
      0
    );

    // 4. Determine severity
    const severity = this.calculateSeverity(totalScore, scores);

    // 5. Log result
    await this.logAnomaly({
      userId: event.userId,
      eventId: event.id,
      totalScore,
      severity,
      checks: scores,
      timestamp: new Date()
    });

    return {
      detected: totalScore > 0.5,
      severity,
      score: totalScore,
      checks: scores
    };
  }

  /**
   * Build user baseline from historical data
   */
  private async getUserBaseline(userId: string): Promise<UserBaseline> {
    const cached = await this.cache.get(`baseline:${userId}`);
    if (cached) return cached;

    // Get last 30 days of events
    const events = await this.db
      .collection('security_events')
      .where('userId', '==', userId)
      .where('timestamp', '>', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .get();

    const baseline: UserBaseline = {
      typical_locations: this.extractLocations(events.docs),
      active_hours: this.extractActiveHours(events.docs),
      known_devices: this.extractDevices(events.docs),
      avg_frequency: events.size / 30, // Events per day
      typical_actions: this.extractActions(events.docs)
    };

    // Cache for 1 hour
    await this.cache.set(`baseline:${userId}`, baseline, { ttl: 3600 });

    return baseline;
  }

  /**
   * Calculate severity based on score and individual checks
   */
  private calculateSeverity(
    totalScore: number,
    checks: Array<{ name: string; score: number; threshold: number }>
  ): 'low' | 'medium' | 'high' {
    // Check if any individual check exceeded threshold
    const criticalChecks = checks.filter(
      c => c.score > c.threshold && ['unusual_device', 'unusual_location'].includes(c.name)
    );

    if (criticalChecks.length > 0 || totalScore > 0.8) {
      return 'high';
    }

    if (totalScore > 0.6) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Handle detected anomaly
   */
  async handleAnomaly(result: AnomalyResult, event: SecurityEvent): Promise<void> {
    if (!result.detected) return;

    // Log for audit
    await this.logger.warn('Anomaly detected', {
      userId: event.userId,
      severity: result.severity,
      score: result.score,
      checks: result.checks
    });

    // Take action based on severity
    if (result.severity === 'high') {
      // Block action and require additional verification
      await this.requireAdditionalAuth(event.userId, event.sessionId);

      // Send alert
      await this.notifications.send(event.userId, {
        title: 'Atividade suspeita detectada',
        body: 'Detectamos uma atividade incomum em sua conta. Por favor, verifique.',
        priority: 'high'
      });

      // Alert security team
      await this.alerting.sendAlert({
        severity: 'high',
        title: 'High-severity anomaly detected',
        userId: event.userId,
        score: result.score
      });
    } else if (result.severity === 'medium') {
      // Log but allow
      await this.notifications.send(event.userId, {
        title: 'Nova atividade detectada',
        body: 'Detectamos um acesso de um novo local/dispositivo.',
        priority: 'medium'
      });
    }
  }

  /**
   * Require additional authentication
   */
  private async requireAdditionalAuth(userId: string, sessionId: string): Promise<void> {
    // Mark session as requiring re-auth
    await this.db
      .collection('users')
      .doc(userId)
      .collection('sessions')
      .doc(sessionId)
      .update({
        requires_reauth: true,
        reauth_reason: 'anomaly_detected'
      });
  }
}

interface UserBaseline {
  typical_locations: Array<{ lat: number; lng: number }>;
  active_hours: number[]; // Hours of day (0-23)
  known_devices: string[];
  avg_frequency: number;
  typical_actions: string[];
}

interface AnomalyResult {
  detected: boolean;
  severity: 'low' | 'medium' | 'high';
  score: number;
  checks: Array<{ name: string; score: number; weight: number }>;
}
```

---

## 8. Security Middleware

### 8.1 Complete Middleware Implementation

```typescript
// packages/api/src/middleware/security.ts

export class SecurityMiddleware {
  private auth: AuthService;
  private rbac: RBACService;
  private anomaly: AnomalyDetectionService;
  private rateLimit: RateLimiter;

  /**
   * Main security middleware
   */
  async validate(request: Request): Promise<SecurityContext> {
    const startTime = Date.now();

    try {
      // 1. AUTHENTICATION
      const token = this.extractToken(request);
      const user = await this.auth.verifyToken(token);

      // 2. SESSION VALIDATION
      const sessionId = request.headers.get('X-Session-ID');
      if (!sessionId) {
        throw new SecurityError('Session ID required', 'MISSING_SESSION');
      }

      const sessionValid = await this.auth.validateSession(user.id, sessionId);
      if (!sessionValid) {
        throw new SecurityError('Invalid session', 'INVALID_SESSION');
      }

      // 3. RATE LIMITING
      const rateLimitKey = `${user.id}:${request.method}:${request.url}`;
      const rateLimitOk = await this.rateLimit.check(rateLimitKey, {
        max: 100,
        window: 60000 // 100 requests per minute
      });

      if (!rateLimitOk) {
        throw new SecurityError('Rate limit exceeded', 'RATE_LIMIT');
      }

      // 4. AUTHORIZATION (if resource specified)
      const resource = this.extractResource(request);
      if (resource) {
        const authorized = await this.rbac.hasPermission(
          user.id,
          resource.type,
          resource.action,
          resource.targetUserId
        );

        if (!authorized) {
          throw new SecurityError('Unauthorized', 'FORBIDDEN');
        }
      }

      // 5. ANOMALY DETECTION
      const event: SecurityEvent = {
        id: crypto.randomUUID(),
        userId: user.id,
        sessionId,
        action: resource?.action || 'unknown',
        resource: resource?.type || 'unknown',
        timestamp: new Date(),
        ipAddress: request.headers.get('X-Forwarded-For') || 'unknown',
        userAgent: request.headers.get('User-Agent') || 'unknown',
        deviceId: request.headers.get('X-Device-ID') || 'unknown',
        location: await this.getLocation(request)
      };

      const anomalyResult = await this.anomaly.analyzeEvent(event);
      if (anomalyResult.detected && anomalyResult.severity === 'high') {
        await this.anomaly.handleAnomaly(anomalyResult, event);
        throw new SecurityError('Suspicious activity detected', 'ANOMALY_BLOCKED');
      }

      // 6. AUDIT LOG
      await this.logSecurityEvent(event);

      // 7. Return security context
      return {
        user,
        sessionId,
        event,
        anomalyScore: anomalyResult.score,
        latency: Date.now() - startTime
      };

    } catch (error) {
      await this.handleSecurityError(error, request);
      throw error;
    }
  }

  /**
   * Extract JWT token from request
   */
  private extractToken(request: Request): string {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new SecurityError('Missing authorization header', 'MISSING_AUTH');
    }
    return authHeader.substring(7);
  }

  /**
   * Extract resource from request
   */
  private extractResource(request: Request): Resource | null {
    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean);

    if (parts.length < 2) return null;

    return {
      type: parts[1], // e.g., "users", "agents", "data"
      action: this.methodToAction(request.method),
      targetUserId: parts[2] // Optional user ID
    };
  }

  /**
   * Map HTTP method to action
   */
  private methodToAction(method: string): string {
    const mapping: Record<string, string> = {
      GET: 'read',
      POST: 'write',
      PUT: 'write',
      PATCH: 'write',
      DELETE: 'delete'
    };
    return mapping[method] || 'unknown';
  }

  /**
   * Get location from IP
   */
  private async getLocation(request: Request): Promise<{ lat: number; lng: number } | null> {
    const ip = request.headers.get('X-Forwarded-For');
    if (!ip) return null;

    // Use IP geolocation service (e.g., MaxMind)
    // For now, return null
    return null;
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(event: SecurityEvent): Promise<void> {
    await this.db.collection('security_events').add({
      ...event,
      timestamp: Timestamp.fromDate(event.timestamp)
    });
  }

  /**
   * Handle security errors
   */
  private async handleSecurityError(error: any, request: Request): Promise<void> {
    await this.logger.error('Security error', {
      error: error.message,
      code: error.code,
      url: request.url,
      method: request.method,
      ip: request.headers.get('X-Forwarded-For')
    });

    // Alert on critical errors
    if (['ANOMALY_BLOCKED', 'SUSPICIOUS_ACTIVITY'].includes(error.code)) {
      await this.alerting.sendAlert({
        severity: 'critical',
        title: 'Security threat blocked',
        error: error.message
      });
    }
  }
}

interface SecurityContext {
  user: User;
  sessionId: string;
  event: SecurityEvent;
  anomalyScore: number;
  latency: number;
}

interface Resource {
  type: string;
  action: string;
  targetUserId?: string;
}
```

---

## 9. Audit Logging

### 9.1 Comprehensive Audit Trail

All sensitive operations must be logged:

```typescript
// packages/security/src/audit-log.ts

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  sessionId: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  changes?: Record<string, { old: any; new: any }>;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  error?: string;
}

export type AuditAction =
  | 'user_login'
  | 'user_logout'
  | 'password_change'
  | '2fa_enabled'
  | '2fa_disabled'
  | 'data_read'
  | 'data_write'
  | 'data_delete'
  | 'agent_execute'
  | 'permission_granted'
  | 'permission_revoked'
  | 'export_data'
  | 'delete_account';

export class AuditLogger {
  /**
   * Log audit event
   */
  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const auditEntry: AuditLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...entry
    };

    // Write to Firestore (immutable)
    await this.db.collection('audit_logs').add(auditEntry);

    // Also write to Cloud Logging for long-term retention
    await this.cloudLogger.write({
      severity: entry.success ? 'INFO' : 'ERROR',
      jsonPayload: auditEntry,
      labels: {
        type: 'audit',
        action: entry.action,
        userId: entry.userId
      }
    });
  }

  /**
   * Query audit logs
   */
  async query(criteria: AuditQueryCriteria): Promise<AuditLogEntry[]> {
    let query = this.db.collection('audit_logs');

    if (criteria.userId) {
      query = query.where('userId', '==', criteria.userId);
    }

    if (criteria.action) {
      query = query.where('action', '==', criteria.action);
    }

    if (criteria.startDate) {
      query = query.where('timestamp', '>=', criteria.startDate);
    }

    if (criteria.endDate) {
      query = query.where('timestamp', '<=', criteria.endDate);
    }

    const snapshot = await query
      .orderBy('timestamp', 'desc')
      .limit(criteria.limit || 100)
      .get();

    return snapshot.docs.map(doc => doc.data() as AuditLogEntry);
  }

  /**
   * Export audit logs for compliance
   */
  async export(userId: string, format: 'json' | 'csv'): Promise<string> {
    const logs = await this.query({
      userId,
      startDate: new Date(0), // All time
      limit: 10000
    });

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    } else {
      return this.convertToCSV(logs);
    }
  }

  private convertToCSV(logs: AuditLogEntry[]): string {
    const headers = [
      'Timestamp',
      'Action',
      'Resource',
      'Success',
      'IP Address',
      'Error'
    ];

    const rows = logs.map(log => [
      log.timestamp.toISOString(),
      log.action,
      log.resource,
      log.success ? 'Yes' : 'No',
      log.ipAddress,
      log.error || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

interface AuditQueryCriteria {
  userId?: string;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}
```

---

## 10. Incident Response

### 10.1 Incident Response Plan

**Severity Levels:**
- **P0 (Critical):** Data breach, system down, security compromise
- **P1 (High):** Partial outage, unauthorized access attempt
- **P2 (Medium):** Performance degradation, non-critical bug
- **P3 (Low):** Minor issue, feature request

**Response SLAs:**
- P0: 5 minutes
- P1: 30 minutes
- P2: 4 hours
- P3: 24 hours

### 10.2 Security Incident Playbooks

#### Playbook 1: Suspected Data Breach

```yaml
incident_type: "data_breach"
severity: "P0"

steps:
  1_detection:
    - Alert triggered by anomaly detection
    - Manual report from user
    - External notification

  2_containment:
    - Isolate affected systems
    - Revoke all sessions for affected users
    - Block suspicious IP addresses
    - Disable compromised accounts

  3_investigation:
    - Review audit logs
    - Analyze security events
    - Identify scope of breach
    - Preserve evidence

  4_eradication:
    - Patch vulnerabilities
    - Reset credentials
    - Remove malware/backdoors
    - Update security rules

  5_recovery:
    - Restore services
    - Re-enable user accounts
    - Monitor for recurrence

  6_post_incident:
    - Document incident
    - Notify affected users (LGPD requirement)
    - Report to authorities (if required)
    - Conduct post-mortem
    - Update security measures
```

#### Playbook 2: Account Takeover

```yaml
incident_type: "account_takeover"
severity: "P1"

steps:
  1_detection:
    - Multiple failed login attempts
    - Login from unusual location
    - Anomaly detection alert

  2_immediate_action:
    - Lock account
    - Revoke all sessions
    - Notify user via secondary channel (SMS/email)

  3_verification:
    - Contact user to verify activity
    - Request identity verification

  4_recovery:
    - Force password reset
    - Re-enable 2FA
    - Review recent activity
    - Restore account if legitimate

  5_post_incident:
    - Document incident
    - Update anomaly detection rules
    - User education on security
```

### 10.3 Automated Response Actions

```typescript
// packages/security/src/incident-response.ts

export class IncidentResponseService {
  /**
   * Automatically respond to security incidents
   */
  async handleIncident(incident: SecurityIncident): Promise<void> {
    // 1. Log incident
    await this.logIncident(incident);

    // 2. Alert team
    await this.alertTeam(incident);

    // 3. Take automated action based on severity
    switch (incident.severity) {
      case 'P0':
        await this.handleCriticalIncident(incident);
        break;
      case 'P1':
        await this.handleHighIncident(incident);
        break;
      default:
        // P2/P3 - log only
        break;
    }
  }

  /**
   * Handle critical (P0) incidents
   */
  private async handleCriticalIncident(incident: SecurityIncident): Promise<void> {
    // 1. Revoke all sessions for affected user
    if (incident.userId) {
      await this.sessionManager.revokeAllSessions(incident.userId);
    }

    // 2. Block suspicious IPs
    if (incident.ipAddress) {
      await this.firewall.blockIP(incident.ipAddress, '24h');
    }

    // 3. Notify security team immediately
    await this.alerting.sendAlert({
      severity: 'critical',
      title: 'P0 Security Incident',
      description: incident.description,
      oncall: true // Pages on-call engineer
    });

    // 4. Create incident ticket
    await this.ticketing.createIncident({
      severity: 'P0',
      title: incident.title,
      description: incident.description,
      assignee: 'security-team'
    });
  }

  /**
   * Handle high (P1) incidents
   */
  private async handleHighIncident(incident: SecurityIncident): Promise<void> {
    // 1. Lock account temporarily
    if (incident.userId) {
      await this.auth.lockAccount(incident.userId, '15m');
    }

    // 2. Require additional verification
    if (incident.userId && incident.sessionId) {
      await this.requireAdditionalAuth(incident.userId, incident.sessionId);
    }

    // 3. Alert security team
    await this.alerting.sendAlert({
      severity: 'high',
      title: 'P1 Security Incident',
      description: incident.description
    });
  }

  /**
   * Log incident
   */
  private async logIncident(incident: SecurityIncident): Promise<void> {
    await this.db.collection('security_incidents').add({
      ...incident,
      timestamp: new Date(),
      status: 'open'
    });
  }
}

export interface SecurityIncident {
  id: string;
  severity: 'P0' | 'P1' | 'P2' | 'P3';
  type: 'data_breach' | 'account_takeover' | 'dos_attack' | 'unauthorized_access';
  title: string;
  description: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  affectedResources: string[];
}
```

---

## 11. Implementation Guide

### 11.1 Phase 0 Implementation (Weeks 1-4)

**Week 3: Security Implementation**

**Days 1-2: Security Middleware**
```bash
# Create security package
cd packages
mkdir security
cd security
npm init -y

# Install dependencies
npm install \
  firebase-admin \
  @google-cloud/kms \
  speakeasy \
  qrcode \
  bcrypt \
  jsonwebtoken
```

**Implementation Checklist:**
- [ ] Create `SecurityMiddleware` class
- [ ] Implement JWT verification
- [ ] Add session validation
- [ ] Setup rate limiting
- [ ] Implement RBAC checks
- [ ] Add anomaly detection
- [ ] Write unit tests

**Days 3-4: Encryption Service**
```typescript
// Test encryption service
import { EncryptionService } from './encryption';

const encryption = new EncryptionService();

// Test encrypt/decrypt
const plaintext = 'sensitive data';
const encrypted = await encryption.encrypt(plaintext, 'user-123');
const decrypted = await encryption.decrypt(encrypted, 'user-123');

console.assert(plaintext === decrypted, 'Encryption failed');
```

**Days 5-7: Agent Sandboxing**
- [ ] Configure gVisor for Cloud Run
- [ ] Implement `AgentSandbox` class
- [ ] Add resource monitoring
- [ ] Test with sample agent
- [ ] Document sandbox configuration

### 11.2 Testing Security

**Unit Tests:**
```typescript
// packages/security/src/__tests__/encryption.test.ts

describe('EncryptionService', () => {
  let encryption: EncryptionService;

  beforeEach(() => {
    encryption = new EncryptionService();
  });

  test('should encrypt and decrypt data', async () => {
    const plaintext = 'test data';
    const userId = 'user-123';

    const encrypted = await encryption.encrypt(plaintext, userId);
    const decrypted = await encryption.decrypt(encrypted, userId);

    expect(decrypted).toBe(plaintext);
  });

  test('should fail decryption with wrong user', async () => {
    const plaintext = 'test data';
    const encrypted = await encryption.encrypt(plaintext, 'user-123');

    await expect(
      encryption.decrypt(encrypted, 'user-456')
    ).rejects.toThrow();
  });

  test('should handle large data', async () => {
    const plaintext = 'x'.repeat(1024 * 1024); // 1MB
    const userId = 'user-123';

    const encrypted = await encryption.encrypt(plaintext, userId);
    const decrypted = await encryption.decrypt(encrypted, userId);

    expect(decrypted).toBe(plaintext);
  });
});
```

**Integration Tests:**
```typescript
// packages/api/src/__tests__/security-middleware.test.ts

describe('SecurityMiddleware', () => {
  test('should reject request without token', async () => {
    const request = new Request('https://api.nous.com/users');

    await expect(
      securityMiddleware.validate(request)
    ).rejects.toThrow('Missing authorization header');
  });

  test('should reject request with invalid token', async () => {
    const request = new Request('https://api.nous.com/users', {
      headers: { Authorization: 'Bearer invalid-token' }
    });

    await expect(
      securityMiddleware.validate(request)
    ).rejects.toThrow('Invalid token');
  });

  test('should allow valid request', async () => {
    const token = await auth.createToken('user-123');
    const sessionId = await sessionManager.createSession('user-123', {});

    const request = new Request('https://api.nous.com/users/user-123', {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Session-ID': sessionId
      }
    });

    const context = await securityMiddleware.validate(request);
    expect(context.user.id).toBe('user-123');
  });
});
```

### 11.3 Deployment

**Cloud KMS Setup:**
```bash
# Create key ring
gcloud kms keyrings create nous-keyring \
  --location southamerica-east1

# Create encryption key
gcloud kms keys create nous-master-key \
  --location southamerica-east1 \
  --keyring nous-keyring \
  --purpose encryption

# Grant service account access
gcloud kms keys add-iam-policy-binding nous-master-key \
  --location southamerica-east1 \
  --keyring nous-keyring \
  --member serviceAccount:nous-sa@project.iam.gserviceaccount.com \
  --role roles/cloudkms.cryptoKeyEncrypterDecrypter
```

**Firestore Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Audit logs are immutable
    match /audit_logs/{logId} {
      allow read: if request.auth != null &&
        (request.auth.token.role == 'admin' || request.auth.token.role == 'dpo');
      allow create: if request.auth != null;
      allow update, delete: if false; // Immutable
    }

    // Security incidents only for admin/security team
    match /security_incidents/{incidentId} {
      allow read, write: if request.auth != null &&
        request.auth.token.role in ['admin', 'security'];
    }
  }
}
```

---

## 12. Monitoring & Alerts

### 12.1 Security Metrics

**Key Metrics to Track:**
- Failed login attempts per minute
- Anomaly detection rate
- Session creation rate
- Permission denial rate
- Encryption/decryption latency
- Agent sandbox violations

**Grafana Dashboard:**
```yaml
security_dashboard:
  panels:
    - title: "Failed Logins (last 24h)"
      query: "sum(rate(failed_logins[5m]))"
      alert_threshold: 100

    - title: "Anomaly Detection Rate"
      query: "sum(rate(anomalies_detected[5m]))"
      alert_threshold: 10

    - title: "Active Sessions"
      query: "count(active_sessions)"

    - title: "High-Severity Incidents"
      query: "sum(security_incidents{severity='P0'})"
      alert_threshold: 1
```

### 12.2 Security Alerts

**Critical Alerts:**
```yaml
alerts:
  - name: "HighFailedLogins"
    expr: "rate(failed_logins[5m]) > 50"
    severity: "P1"
    channels: ["pagerduty", "slack"]

  - name: "DataBreachDetected"
    expr: "sum(security_incidents{type='data_breach'}) > 0"
    severity: "P0"
    channels: ["pagerduty", "sms", "email"]

  - name: "UnusualDataAccess"
    expr: "rate(data_access{hour_of_day < 6 OR hour_of_day > 22}[5m]) > 10"
    severity: "P2"
    channels: ["slack"]
```

---

## Appendix

### A. Glossary

- **Zero-Trust:** Security model assuming no implicit trust
- **2FA/MFA:** Two-Factor / Multi-Factor Authentication
- **RBAC:** Role-Based Access Control
- **AES-256-GCM:** Advanced Encryption Standard with Galois/Counter Mode
- **KMS:** Key Management Service
- **DEK:** Data Encryption Key
- **TOTP:** Time-based One-Time Password
- **WebAuthn:** Web Authentication API (for biometrics/hardware keys)
- **gVisor:** Application kernel for containers (sandboxing)

### B. References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
- [LGPD Official Text](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

---

**Document Status:** ✅ Complete
**Next:** Implement security middleware (PHASE-0-FOUNDATION.md Week 3)

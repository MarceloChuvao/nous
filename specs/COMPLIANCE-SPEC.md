# NOUS OS - Compliance Specification (LGPD/GDPR)

> **Version:** 1.0.0
> **Last Updated:** 2025-01-19
> **Status:** Production Critical - Must Complete Before Launch
> **Applies To:** All Phases

---

## 📋 Table of Contents

1. [Overview](#1-overview)
2. [LGPD Compliance](#2-lgpd-compliance)
3. [GDPR Compliance (if EU users)](#3-gdpr-compliance)
4. [Data Protection Officer](#4-data-protection-officer)
5. [Consent Management](#5-consent-management)
6. [Data Subject Rights](#6-data-subject-rights)
7. [Data Retention & Deletion](#7-data-retention--deletion)
8. [Breach Notification](#8-breach-notification)
9. [Implementation Guide](#9-implementation-guide)

---

## 1. Overview

### Legal Requirements

NOUS OS processes sensitive personal data (health, finance) and must comply with:

1. **LGPD (Lei Geral de Proteção de Dados)** - Brazil
   - Effective: September 2020
   - Applies to: All Brazilian users
   - Penalties: Up to 2% of revenue (max R$ 50M per violation)

2. **GDPR (General Data Protection Regulation)** - EU
   - Effective: May 2018
   - Applies to: If we serve EU users
   - Penalties: Up to 4% of global revenue or €20M

### Data Classification

| Category | Examples | LGPD Classification | Encryption Required |
|----------|----------|---------------------|---------------------|
| **Sensitive** | Health data, biometrics | Dados Sensíveis | ✅ Yes (E2E) |
| **Financial** | Bank accounts, transactions | Dados Pessoais | ✅ Yes (AES-256) |
| **Personal** | Name, email, CPF | Dados Pessoais | ✅ Yes |
| **Usage** | Logs, analytics | Dados Anonimizados | ❌ No (if anonymized) |

### Key Principles

1. **Lawfulness:** Only collect data with legal basis (consent, contract, legal obligation)
2. **Purpose Limitation:** Use data only for stated purposes
3. **Data Minimization:** Collect only what's necessary
4. **Accuracy:** Keep data up-to-date
5. **Storage Limitation:** Delete when no longer needed
6. **Integrity & Confidentiality:** Encrypt and protect data
7. **Accountability:** Document compliance measures

---

## 2. LGPD Compliance

### 2.1 Legal Bases for Processing

NOUS processes personal data under these legal bases:

| Processing Activity | Legal Basis (LGPD Article) | Justification |
|---------------------|---------------------------|---------------|
| **Account creation** | Art. 7, I - Consent | User explicitly agrees to Terms |
| **Health data storage** | Art. 11, II(a) - Consent | User uploads health documents |
| **Financial data sync** | Art. 7, V - Contract execution | Necessary for service delivery |
| **Security monitoring** | Art. 7, IX - Legitimate interest | Protect user data |
| **Email communications** | Art. 7, I - Consent | User opts in |
| **Analytics (anonymized)** | Art. 7, X - Legitimate interest | Service improvement |

### 2.2 Data Controller vs Processor

- **NOUS OS (Data Controller):** Determines purposes and means of processing
- **Sub-processors:**
  - Google Cloud (Firebase, Cloud Run) - Infrastructure
  - OpenAI, Anthropic - LLM APIs
  - Pluggy - Open Banking aggregation

**Contractual Requirements:**
- All sub-processors must sign DPA (Data Processing Agreement)
- Must process data only per NOUS instructions
- Must implement adequate security measures

### 2.3 Data Transfers (International)

**Challenge:** Some sub-processors (OpenAI, Anthropic, Pinecone) are US-based.

**LGPD Requirement (Art. 33):** International transfers require:
1. Adequate level of protection in destination country, OR
2. Specific contractual safeguards (Standard Contractual Clauses), OR
3. Explicit user consent

**NOUS Approach:**
- ✅ Use Standard Contractual Clauses (SCCs) with all US vendors
- ✅ Obtain explicit consent for health/finance data processing
- ✅ Encrypt data before sending to APIs
- ✅ Prefer Brazilian or EU vendors where possible (e.g., Pinecone has BR region)

### 2.4 Required Policies & Documents

- [ ] **Privacy Policy** (user-facing, Portuguese + English)
- [ ] **Terms of Service**
- [ ] **Cookie Policy**
- [ ] **Data Processing Agreement** (for sub-processors)
- [ ] **Data Protection Impact Assessment (DPIA)** (for high-risk processing)
- [ ] **Incident Response Plan**

---

## 3. GDPR Compliance

### Key Differences from LGPD

| Aspect | LGPD | GDPR |
|--------|------|------|
| **Penalties** | Up to 2% revenue, R$ 50M max | Up to 4% revenue, €20M max |
| **Consent age** | 18 years (or parental consent) | 16 years (13-16 varies by country) |
| **DPO requirement** | Recommended | Mandatory (if processing sensitive data) |
| **Right to portability** | Yes | Yes (more detailed) |
| **Data localization** | No requirement | No requirement |

### If Serving EU Users

**Additional requirements:**
- ✅ Appoint EU Representative (if no EU establishment)
- ✅ Stricter consent requirements (explicit opt-in, no pre-checked boxes)
- ✅ Cookie consent (granular per cookie type)
- ✅ One-month deadline for data subject requests (vs 15 days in LGPD)

**NOUS Decision:** Initially target Brazil only. Add EU support in Phase 4+.

---

## 4. Data Protection Officer (DPO)

### LGPD Requirements (Art. 41)

**Mandatory if:**
- Processing personal data is core business activity (✅ Yes for NOUS)
- Processing large scale of sensitive data (✅ Yes - health, finance)

**DPO Responsibilities:**
1. Accept complaints and requests from data subjects
2. Provide guidance on LGPD compliance
3. Interface with ANPD (Brazilian Data Protection Authority)
4. Report data breaches to ANPD

### NOUS DPO Setup

```yaml
dpo:
  name: "[TO BE APPOINTED]"
  email: "dpo@nous.com.br"
  phone: "+55 11 XXXX-XXXX"

  responsibilities:
    - Review data processing activities
    - Manage data subject requests (access, deletion, etc.)
    - Coordinate breach response
    - Liaise with ANPD
    - Train team on LGPD compliance

  reporting_to:
    - CEO
    - Legal Counsel

  tools:
    - DPO dashboard (Firestore + Admin UI)
    - Data subject request portal
    - Breach notification system
```

### DPO Dashboard (Admin Tool)

```typescript
// apps/admin/app/dpo/page.tsx

export default function DPODashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">DPO Dashboard</h1>

      {/* Data Subject Requests */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Data Subject Requests</h2>
        <DataSubjectRequestsTable />
      </div>

      {/* Consent Management */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Consent Audit</h2>
        <ConsentAuditLog />
      </div>

      {/* Breach Incidents */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Security Incidents</h2>
        <SecurityIncidentsTable />
      </div>

      {/* Data Inventory */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Data Inventory</h2>
        <DataInventory />
      </div>
    </div>
  );
}
```

---

## 5. Consent Management

### 5.1 Consent Requirements (LGPD Art. 8)

Consent must be:
- **Free:** No coercion
- **Informed:** Clear explanation of purpose
- **Unambiguous:** Affirmative action (no pre-checked boxes)
- **Specific:** Separate consent for each purpose
- **Granular:** User can consent to some but not all processing

### 5.2 Consent Types in NOUS

**Account Data (Required):**
```
☑️ I agree to NOUS processing my account data (name, email, password)
   for providing the service. [Required to use NOUS]
```

**Health Data (Optional but recommended):**
```
☐ I consent to NOUS processing my health data (exams, medications)
   to provide health insights and recommendations.

   Data will be encrypted and accessible only to you and authorized
   health agents. You can revoke this consent anytime.

   [Learn more about health data processing]
```

**Finance Data (Optional but recommended):**
```
☐ I consent to NOUS processing my financial data (bank accounts,
   transactions) to provide financial insights and recommendations.

   Data will be encrypted and never shared with third parties without
   your explicit permission.

   [Learn more about financial data processing]
```

**Marketing Communications (Optional):**
```
☐ I want to receive product updates and tips via email.
   You can unsubscribe anytime.
```

### 5.3 Consent Collection Flow

```typescript
// components/ConsentManager.tsx

export function ConsentManager({ userId }: { userId: string }) {
  const [consents, setConsents] = useState({
    account_data: false, // Required
    health_data: false,
    finance_data: false,
    marketing: false
  });

  const handleSubmit = async () => {
    if (!consents.account_data) {
      alert('Account data consent is required to use NOUS');
      return;
    }

    // Store consent
    await fetch('/api/consent', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        consents: {
          account_data: {
            granted: true,
            timestamp: new Date().toISOString(),
            purpose: 'Service delivery',
            legal_basis: 'consent'
          },
          health_data: {
            granted: consents.health_data,
            timestamp: new Date().toISOString(),
            purpose: 'Health insights and recommendations',
            legal_basis: 'consent'
          },
          finance_data: {
            granted: consents.finance_data,
            timestamp: new Date().toISOString(),
            purpose: 'Financial insights and recommendations',
            legal_basis: 'consent'
          },
          marketing: {
            granted: consents.marketing,
            timestamp: new Date().toISOString(),
            purpose: 'Marketing communications',
            legal_basis: 'consent'
          }
        },
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent
      })
    });

    // Proceed to app
    router.push('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Data, Your Choice</h1>
      <p className="text-gray-600 mb-6">
        NOUS needs your permission to process certain types of data.
        You can change these settings anytime.
      </p>

      {/* Required consent */}
      <div className="mb-6 border rounded-lg p-4 bg-blue-50">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={consents.account_data}
            onChange={(e) => setConsents({...consents, account_data: e.target.checked})}
            className="mt-1"
          />
          <div>
            <div className="font-medium">Account Data (Required)</div>
            <div className="text-sm text-gray-600 mt-1">
              Name, email, password - necessary to provide the service.
            </div>
          </div>
        </label>
      </div>

      {/* Optional consents */}
      <ConsentCheckbox
        id="health_data"
        title="Health Data (Optional)"
        description="Exams, medications, health metrics - enables AI health insights."
        checked={consents.health_data}
        onChange={(checked) => setConsents({...consents, health_data: checked})}
      />

      <ConsentCheckbox
        id="finance_data"
        title="Financial Data (Optional)"
        description="Bank accounts, transactions - enables AI financial advice."
        checked={consents.finance_data}
        onChange={(checked) => setConsents({...consents, finance_data: checked})}
      />

      <ConsentCheckbox
        id="marketing"
        title="Marketing Emails (Optional)"
        description="Product updates and tips - you can unsubscribe anytime."
        checked={consents.marketing}
        onChange={(checked) => setConsents({...consents, marketing: checked})}
      />

      <button onClick={handleSubmit} className="btn-primary mt-6 w-full">
        Continue
      </button>

      <div className="mt-4 text-xs text-gray-500 text-center">
        By continuing, you agree to our{' '}
        <a href="/privacy" className="underline">Privacy Policy</a> and{' '}
        <a href="/terms" className="underline">Terms of Service</a>.
      </div>
    </div>
  );
}
```

### 5.4 Consent Storage

```typescript
// firestore schema: /users/{userId}/consents

interface ConsentRecord {
  granted: boolean;
  timestamp: string; // ISO 8601
  purpose: string;
  legal_basis: 'consent' | 'contract' | 'legitimate_interest' | 'legal_obligation';
  withdrawn_at?: string; // If user revokes
  ip_address: string; // Proof of consent
  user_agent: string;
}

interface UserConsents {
  account_data: ConsentRecord;
  health_data: ConsentRecord;
  finance_data: ConsentRecord;
  marketing: ConsentRecord;
  updated_at: string;
}
```

---

## 6. Data Subject Rights

### 6.1 LGPD Rights (Art. 18)

Users have the right to:

1. **Confirmation of processing** - Know if NOUS has their data
2. **Access** - Get copy of their data
3. **Correction** - Fix inaccurate data
4. **Anonymization/Deletion** - Erase personal data
5. **Portability** - Export data in structured format
6. **Information about sharing** - Know who NOUS shares data with
7. **Refusal** - Opt out of non-essential processing
8. **Revoke consent** - Withdraw consent anytime

**Response Deadline:** 15 days (LGPD Art. 18, §1º)

### 6.2 Data Subject Request Portal

```typescript
// apps/lens/app/privacy/requests/page.tsx

export default function DataSubjectRequestPage() {
  const [requestType, setRequestType] = useState<RequestType | null>(null);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Privacy Rights</h1>

      <p className="text-gray-600 mb-8">
        Under LGPD, you have rights over your personal data.
        Select an option below to exercise your rights.
      </p>

      {/* Request types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <RequestTypeCard
          icon="📥"
          title="Download My Data"
          description="Get a copy of all your data in JSON format"
          onClick={() => setRequestType('export')}
        />

        <RequestTypeCard
          icon="🗑️"
          title="Delete My Account"
          description="Permanently delete your account and all data"
          onClick={() => setRequestType('deletion')}
        />

        <RequestTypeCard
          icon="✏️"
          title="Correct My Data"
          description="Report inaccurate personal information"
          onClick={() => setRequestType('correction')}
        />

        <RequestTypeCard
          icon="🚫"
          title="Revoke Consent"
          description="Withdraw consent for specific data processing"
          onClick={() => setRequestType('revoke')}
        />
      </div>

      {/* Request form */}
      {requestType && (
        <RequestForm
          type={requestType}
          onSubmit={handleSubmit}
          onCancel={() => setRequestType(null)}
        />
      )}
    </div>
  );
}
```

### 6.3 Data Export Implementation

```typescript
// packages/compliance/src/data-export.ts

export class DataExporter {
  /**
   * Export all user data in structured format
   */
  async exportUserData(userId: string): Promise<ExportData> {
    const data: ExportData = {
      exported_at: new Date().toISOString(),
      user_id: userId,
      sections: {}
    };

    // 1. Account data
    data.sections.account = await this.exportAccount(userId);

    // 2. Health data (if consented)
    const hasHealthConsent = await this.hasConsent(userId, 'health_data');
    if (hasHealthConsent) {
      data.sections.health = await this.exportHealth(userId);
    }

    // 3. Finance data (if consented)
    const hasFinanceConsent = await this.hasConsent(userId, 'finance_data');
    if (hasFinanceConsent) {
      data.sections.finance = await this.exportFinance(userId);
    }

    // 4. Consents
    data.sections.consents = await this.exportConsents(userId);

    // 5. Agent usage
    data.sections.agent_usage = await this.exportAgentUsage(userId);

    // 6. Logs (last 90 days)
    data.sections.logs = await this.exportLogs(userId);

    return data;
  }

  private async exportAccount(userId: string): Promise<any> {
    const user = await this.db.collection('users').doc(userId).get();
    return {
      id: user.id,
      email: user.data()?.email,
      name: user.data()?.name,
      created_at: user.data()?.created_at,
      last_login: user.data()?.last_login
    };
  }

  private async exportHealth(userId: string): Promise<any> {
    const health = await this.vfs.read('context:health.*', userId);
    return {
      bloodwork: health.exams,
      medications: health.medications,
      vitals: health.vitals
    };
  }

  private async exportFinance(userId: string): Promise<any> {
    const finance = await this.vfs.read('context:finance.*', userId);
    return {
      accounts: finance.accounts,
      transactions: finance.transactions,
      budget: finance.budget
    };
  }

  private async exportConsents(userId: string): Promise<any> {
    const consents = await this.db
      .collection('users')
      .doc(userId)
      .collection('consents')
      .get();

    return consents.docs.map(doc => doc.data());
  }

  /**
   * Generate downloadable JSON file
   */
  async generateExportFile(userId: string): Promise<string> {
    const data = await this.exportUserData(userId);

    // Upload to Cloud Storage (temporary, 7-day expiry)
    const filename = `export_${userId}_${Date.now()}.json`;
    const blob = await this.storage
      .bucket('nous-data-exports')
      .file(filename)
      .save(JSON.stringify(data, null, 2));

    // Generate signed URL (valid 7 days)
    const [url] = await this.storage
      .bucket('nous-data-exports')
      .file(filename)
      .getSignedUrl({
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000
      });

    return url;
  }
}
```

### 6.4 Account Deletion Implementation

```typescript
// packages/compliance/src/data-deletion.ts

export class DataDeletion {
  /**
   * Permanently delete user account and all data
   */
  async deleteUserAccount(userId: string): Promise<void> {
    // 1. Verify user identity (require re-authentication)
    await this.requireReAuth(userId);

    // 2. Cancel active subscriptions
    await this.cancelSubscriptions(userId);

    // 3. Notify connected services
    await this.notifyConnectedServices(userId);

    // 4. Delete user data (cascading)
    await this.deleteUserData(userId);

    // 5. Log deletion (for compliance audit)
    await this.logDeletion(userId);

    // 6. Send confirmation email
    await this.sendDeletionConfirmation(userId);
  }

  private async deleteUserData(userId: string): Promise<void> {
    // Delete from VFS
    await this.vfs.delete(`users/${userId}/*`);

    // Delete Firestore collections
    const collections = [
      'context',
      'profile',
      'vault',
      'logs',
      'consents',
      'sessions',
      'agent_permissions'
    ];

    for (const collection of collections) {
      const docs = await this.db
        .collection('users')
        .doc(userId)
        .collection(collection)
        .get();

      const batch = this.db.batch();
      docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }

    // Delete user document
    await this.db.collection('users').doc(userId).delete();

    // Delete from vector DB
    await this.vectorDB.delete({ filter: { userId } });

    // Delete from Cloud Storage
    await this.storage.bucket('nous-vault').deleteFiles({
      prefix: `users/${userId}/`
    });
  }

  private async logDeletion(userId: string): Promise<void> {
    // Keep minimal log for compliance (proves we deleted data)
    await this.db.collection('deleted_accounts').add({
      user_id_hash: await this.hash(userId), // Hashed for privacy
      deleted_at: new Date(),
      deletion_method: 'user_request',
      ip_address: await this.getCurrentIP()
    });
  }
}
```

---

## 7. Data Retention & Deletion

### 7.1 Retention Policies

| Data Type | Retention Period | Reason |
|-----------|-----------------|--------|
| **Account data** | Until account deletion | Service delivery |
| **Health data** | Until user deletes or account closure | User preference |
| **Finance data** | 7 years (Brazil tax law) | Legal obligation |
| **Logs (security)** | 2 years | Security investigations |
| **Logs (analytics)** | 90 days (anonymized after) | Service improvement |
| **Consents** | 5 years after withdrawal | Proof of compliance |
| **Deleted account records** | 5 years | Proof of deletion |

### 7.2 Automated Deletion Jobs

```typescript
// functions/src/cron/data-retention.ts

export const cleanupExpiredData = functions.pubsub
  .schedule('0 2 * * *') // Daily at 2 AM
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    // 1. Delete old analytics logs (>90 days)
    await deleteOldLogs('analytics', 90);

    // 2. Anonymize old security logs (>2 years)
    await anonymizeOldLogs('security', 730);

    // 3. Delete temporary exports (>7 days)
    await deleteOldExports(7);

    // 4. Delete closed accounts (>30 days in "pending deletion")
    await deletePendingAccounts(30);
  });
```

---

## 8. Breach Notification

### 8.1 LGPD Requirements (Art. 48)

If data breach occurs, NOUS must:

1. **Notify ANPD** (Data Protection Authority)
   - Timeline: "Reasonable time" (interpret as 72 hours)
   - Content: Nature of breach, affected data, mitigation measures

2. **Notify Affected Users**
   - Timeline: If breach poses risk to users
   - Method: Email, app notification, or website notice
   - Content: What happened, what data affected, what to do

### 8.2 Breach Response Plan

```yaml
breach_response:
  phase_1_detection:
    - Security monitoring detects anomaly
    - Alert sent to security team
    - DPO notified immediately

  phase_2_assessment:
    - Determine scope (how many users, what data)
    - Assess risk level (high, medium, low)
    - Document timeline of breach

  phase_3_containment:
    - Stop the breach (block IP, revoke keys, etc.)
    - Preserve evidence for investigation
    - Implement immediate fixes

  phase_4_notification:
    - If high risk: Notify ANPD within 72h
    - If medium/high risk: Notify affected users
    - Public statement if media coverage

  phase_5_remediation:
    - Investigate root cause
    - Implement long-term fixes
    - Update security measures
    - Train team on lessons learned
```

### 8.3 Breach Notification Templates

**Email to Users:**
```
Subject: Important Security Notice - NOUS OS

Dear [Name],

We are writing to inform you of a security incident that may have affected your NOUS account.

What Happened:
On [DATE], we discovered [DESCRIPTION OF BREACH]. We immediately took steps to secure our systems and investigate the incident.

What Data Was Affected:
[LIST OF DATA TYPES - e.g., "Your name and email address"]

What We're Doing:
- We have [CONTAINMENT MEASURES]
- We are working with security experts to investigate
- We have notified the appropriate authorities (ANPD)

What You Should Do:
- Change your NOUS password immediately
- [OTHER SPECIFIC ACTIONS]
- Monitor your accounts for suspicious activity

We take your privacy seriously and sincerely apologize for this incident.

For questions, contact our Data Protection Officer:
dpo@nous.com.br

[SIGNATURE]
```

**Notification to ANPD:**
(Via official form on ANPD website)

---

## 9. Implementation Guide

### Week 1: Policies & Documentation
- [ ] Draft Privacy Policy (lawyer review)
- [ ] Draft Terms of Service (lawyer review)
- [ ] Create Cookie Policy
- [ ] Appoint DPO

### Week 2: Consent Management
- [ ] Implement consent UI
- [ ] Store consent records in Firestore
- [ ] Add consent audit log
- [ ] Test consent workflow

### Week 3: Data Subject Rights
- [ ] Build data export functionality
- [ ] Build account deletion flow
- [ ] Create DPO dashboard
- [ ] Test all request types

### Week 4: Breach Response
- [ ] Document breach response plan
- [ ] Create notification templates
- [ ] Setup alerting for anomalies
- [ ] Train team on procedures

### Ongoing
- [ ] Review data retention policies quarterly
- [ ] Audit sub-processors annually
- [ ] Update DPIAs for new features
- [ ] Monitor ANPD guidance updates

---

## Summary

**LGPD/GDPR compliance is mandatory before production launch.**

Key deliverables:
- ✅ Privacy Policy published
- ✅ Consent management implemented
- ✅ Data subject rights operational (export, deletion)
- ✅ DPO appointed
- ✅ Breach response plan documented
- ✅ Data retention policies enforced

**Penalties for non-compliance:** Up to 2% of revenue (LGPD) or 4% (GDPR).

**Status:** Critical path - must complete before public launch.

---

**Document Status:** ✅ Complete
**Next:** MONITORING-SPEC.md, PERFORMANCE-SPEC.md

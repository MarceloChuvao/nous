# NOUS OS: Developer Task Specifications

**Status:** APPROVED FOR DEVELOPMENT
**Purpose:** Provide unambiguous, code-level instructions for developers.
**Context:** These tasks implement the Health Vertical (Phase 1) on the Foundation (Phase 0).

---

## 🏗️ Module: Core Foundation

### 🎫 TASK-CORE-01: Implement Universal Context Schema
**Goal:** Define the strict data shape for all user memory to prevent data corruption.
**Target File:** `packages/shared/src/schemas/context.ts`

**Technical Specifications:**
1.  **Import:** `z` from `zod`.
2.  **Define `ContextBlockSchema`:**
    *   `id`: UUID v4 (string).
    *   `schemaId`: String (e.g., "health-exam-v1").
    *   `timestamp`: Number (Unix ms).
    *   `data`: `z.record(z.any())` (The flexible payload).
    *   `metadata`: Object containing:
        *   `source`: String (e.g., "upload:file.pdf").
        *   `confidence`: Optional Number (0-1).
        *   `processingTime`: Optional Number (ms).
3.  **Export Type:** `export type ContextBlock = z.infer<typeof ContextBlockSchema>;`

**Validation Rules:**
*   `timestamp` must not be in the future.
*   `data` must not be empty.

---

### 🎫 TASK-CORE-02: Implement Kernel Dispatcher Logic
**Goal:** Route incoming requests to the correct Agent Runtime based on permissions.
**Target File:** `apps/kernel/src/api/dispatcher.ts`

**Algorithm:**
1.  **Auth Check:** Verify `context.auth.uid` exists. Throw `UNAUTHENTICATED` if null.
2.  **Load Manifest:** Fetch `system/agents/{agentId}` from Firestore.
    *   *Error:* If doc missing, throw `NOT_FOUND`.
3.  **Permission Check:**
    *   Iterate `agent.permissions` (e.g., `["read:context.health.*"]`).
    *   Check if `request.resource` matches any permission pattern.
    *   *Error:* If no match, throw `PERMISSION_DENIED`.
4.  **Runtime Invocation:**
    *   If `agent.type === 'python'`, HTTP POST to Cloud Run Service URL.
    *   If `agent.type === 'node'`, `await` local function.
5.  **Logging:**
    *   Write to `users/{uid}/logs`: `{ agentId, action, status: 'success', duration }`.

---

## 🏥 Module: Health Vertical

### 🎫 TASK-HEALTH-01: Define Health Exam Data Contract
**Goal:** Create the Zod Schema that validates extracted medical data.
**Target File:** `packages/shared/src/schemas/health.ts`

**Code Specification:**
```typescript
import { z } from 'zod';

export const HealthMetricSchema = z.object({
  name: z.string().min(1, "Metric name required"), // e.g. "Hemoglobin"
  value: z.number(), // e.g. 14.5
  unit: z.string(), // e.g. "g/dL"
  refRange: z.string().optional(), // e.g. "13.5-17.5"
  status: z.enum(['normal', 'high', 'low', 'critical'])
});

export const HealthExamSchema = z.object({
  provider: z.string(), // e.g. "LabCorp"
  date: z.string().datetime(), // ISO 8601
  type: z.enum(['blood', 'imaging', 'checkup']),
  metrics: z.array(HealthMetricSchema).min(1, "At least one metric required")
});

export type HealthExam = z.infer<typeof HealthExamSchema>;
```

---

### 🎫 TASK-HEALTH-02: Implement OCR Driver
**Goal:** Convert raw PDF/Image to Markdown text using Google Vision.
**Target File:** `apps/kernel/src/drivers/ocr.ts`

**Inputs:** `gcsPath` (string) - e.g., `gs://bucket/vault/health/raw/file.pdf`
**Outputs:** `Promise<string>` (Markdown)

**Logic:**
1.  **Init Client:** Instantiate `ImageAnnotatorClient`.
2.  **Call API:** `client.documentTextDetection(gcsPath)`.
3.  **Parse Response:**
    *   Iterate `fullTextAnnotation.pages`.
    *   Join paragraphs with `\n\n`.
4.  **Post-Processing:**
    *   Remove excessive whitespace.
    *   *Constraint:* If text length < 50 chars, throw `OCR_FAILED_EMPTY`.

---

### 🎫 TASK-HEALTH-03: Implement Librarian Agent (Extraction)
**Goal:** Extract structured `HealthExam` JSON from OCR Markdown.
**Target File:** `apps/kernel/src/agents/core/librarian.ts`

**System Prompt:**
```text
ROLE: Specialist Medical Data Entry Clerk.
INPUT: Raw OCR text from a medical exam.
TASK: Extract data into JSON format matching the schema.
RULES:
1. Map "Hemoglobina" -> "Hemoglobin" (Translate to English standard).
2. If a value is "14,5", convert to number 14.5.
3. Determine 'status' (normal/high/low) based on the reference range in the text.
4. OUTPUT ONLY JSON. No markdown fencing.
```

**Logic:**
1.  **Call LLM:** Send Prompt + OCR Text.
2.  **Parse JSON:** `JSON.parse(llmResponse)`.
3.  **Validate:** `HealthExamSchema.parse(json)`.
    *   *Retry Strategy:* If Zod throws error, feed error back to LLM and retry (Max 3 attempts).
4.  **Persist:** Call `vfs.write('context/health/exams/{uuid}', validatedJson)`.

---

### 🎫 TASK-HEALTH-04: Implement Physician Agent (Analysis)
**Goal:** Generate clinical insights based on the new exam and history.
**Target File:** `apps/kernel/src/agents/health/physician.ts`

**Inputs:** `newExam` (HealthExam object)

**Logic:**
1.  **Fetch History:**
    *   Query VFS: `vfs.query('health', { type: 'blood', limit: 5 })`.
    *   Filter for matching metrics (e.g., previous "Cholesterol").
2.  **Generate Analysis (LLM):**
    *   Prompt: "Compare current values vs history. Highlight trends (e.g., 'Rising Cholesterol'). Flag critical values."
3.  **Create Report:**
    *   Structure: `{ summary: string, trends: Trend[], recommendations: string[] }`.
4.  **Persist:** `vfs.write('context/health/analysis/{examId}', report)`.

---

### 🎫 TASK-FRONT-01: Configure Health Card
**Goal:** Tell the Universal Card Engine how to render the Health Data.
**Target File:** `apps/web/config/cards/health-latest.json`

**JSON Specification:**
```json
{
  "id": "health-latest-bloodwork",
  "title": "Latest Results",
  "dataSource": "context.health.exams.latest",
  "layout": "grid",
  "variables": [
    {
      "key": "metrics[name='Total Cholesterol'].value",
      "label": "Cholesterol",
      "display": "badge",
      "rules": [
        { "operator": ">", "value": 200, "color": "red", "icon": "alert-circle" },
        { "operator": "<=", "value": 200, "color": "green", "icon": "check" }
      ]
    },
    {
      "key": "date",
      "label": "Date",
      "display": "date",
      "format": "MMM DD, YYYY"
    }
  ]
}
```

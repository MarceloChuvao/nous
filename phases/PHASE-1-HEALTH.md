# NOUS OS - Phase 1: Health Vertical

> **Version:** 1.0.0
> **Last Updated:** 2025-01-19
> **Status:** Ready for Implementation
> **Timeline:** Weeks 5-12 (8 weeks)

---

## 📋 Table of Contents

1. [Overview](#1-overview)
2. [Objectives](#2-objectives)
3. [Architecture](#3-architecture)
4. [Week-by-Week Plan](#4-week-by-week-plan)
5. [Implementation Backlog](#5-implementation-backlog)
6. [Technical Design Decisions](#6-technical-design-decisions)
7. [Success Criteria](#7-success-criteria)
8. [Dependencies](#8-dependencies)

---

## 1. Overview

### What is Phase 1?

Phase 1 introduces the **Health Vertical** - the first specialized domain in NOUS OS. This phase builds on the foundation from Phase 0 to deliver:

- **Health Agents:** Specialized AI workers (@health/physician, @health/nutritionist)
- **Medical Document Processing:** OCR for lab results, prescriptions, medical reports
- **Health Dashboard:** Unified view of health metrics and trends
- **Medication Reminders:** HOOKS-based proactive alerts
- **FHIR Integration:** Standard-compliant health data

### Why Health First?

1. **High Impact:** Health data is personal and critical - perfect showcase for NOUS
2. **Clear Value:** Users immediately see benefit (medication tracking, exam analysis)
3. **Privacy Critical:** Validates our security architecture with sensitive data
4. **Foundation for Other Verticals:** Patterns learned apply to finance, life, etc.

### Phase 1 Outcomes

By end of Phase 1, users can:
- Upload medical documents (PDFs, images) → Auto-extract data
- Ask questions like "Meu colesterol está normal?" → Get expert analysis
- Receive proactive medication reminders
- View health trends on dashboard
- Get dietary recommendations based on health data

---

## 2. Objectives

### Primary Goals

1. **Launch Health Vertical** (P0)
   - At least 2 health agents operational
   - Medical document OCR working
   - Health dashboard live

2. **Validate Agent Architecture** (P0)
   - Sub-agent delegation proven
   - HOOKS system working
   - Permission model tested

3. **User Adoption** (P1)
   - 100+ beta users actively using health features
   - 70%+ retention after 7 days
   - NPS > 50

### Technical Deliverables

- ✅ @health/physician agent (medical interpretation)
- ✅ @health/nutritionist agent (dietary advice)
- ✅ Medical document OCR pipeline
- ✅ Health dashboard (frontend)
- ✅ Medication reminder HOOKS
- ✅ FHIR-compatible data models
- ✅ Health data privacy controls

### Non-Goals (Phase 2+)

- ❌ Wearable device integration (Phase 2)
- ❌ Telemedicine integration (Phase 2)
- ❌ Health insurance claims (Phase 2)
- ❌ Appointment scheduling (Phase 2)

---

## 3. Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    LENS (Frontend)                      │
│  ┌───────────────────────────────────────────────────┐ │
│  │         Health Dashboard                          │ │
│  │  - Metrics visualization                          │ │
│  │  - Medication tracker                             │ │
│  │  - Exam timeline                                  │ │
│  │  - Document uploader                              │ │
│  └───────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS/JSON
                        ↓
┌─────────────────────────────────────────────────────────┐
│                 CORE Agent (KERNEL)                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Intent: "Meu colesterol está normal?"          │   │
│  │     ↓                                            │   │
│  │  Route: context:health.bloodwork                │   │
│  │     ↓                                            │   │
│  │  Fetch: { cholesterol: 185, date: "2025-01-15" }│   │
│  │     ↓                                            │   │
│  │  Delegate: @health/physician (complex analysis) │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
┌───────────────┐ ┌──────────────┐ ┌─────────────┐
│  @health/     │ │  @health/    │ │   OCR       │
│  physician    │ │ nutritionist │ │  Pipeline   │
│               │ │              │ │             │
│ Claude Opus   │ │Claude Sonnet │ │ Tesseract + │
│ Medical       │ │ Nutrition    │ │ Claude      │
│ Knowledge     │ │ Guidelines   │ │ Extraction  │
└───────┬───────┘ └──────┬───────┘ └──────┬──────┘
        │                │                │
        └────────────────┼────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              VFS (Data Layer)                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  CONTEXT:health                                   │  │
│  │  - bloodwork: { cholesterol, glucose, ... }      │  │
│  │  - medications: [{ name, dosage, schedule }]     │  │
│  │  - exams: [{ type, date, results }]              │  │
│  │  - vitals: { bp, hr, weight }                    │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  VAULT:health                                     │  │
│  │  - /exams/*.pdf (lab results)                    │  │
│  │  - /prescriptions/*.pdf                          │  │
│  │  - /images/*.jpg (medical images)                │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              HOOKS (Automation)                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  medication_reminder:                             │  │
│  │    trigger: onSchedule (daily 9am)               │  │
│  │    action: Check due medications → Send alert    │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  exam_followup:                                   │  │
│  │    trigger: onContextUpdate(health.exams)        │  │
│  │    action: If abnormal → Suggest doctor visit    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| **Health Agents** | Claude Opus + Custom prompts | Best medical reasoning |
| **OCR Engine** | Tesseract 5.0 | Open-source, multilingual |
| **Text Extraction** | Claude Sonnet 4 | Structured data from text |
| **Dashboard** | Next.js + Recharts | Fast, responsive charts |
| **HOOKS Runtime** | Cloud Scheduler + Cloud Functions | Reliable cron jobs |
| **Data Model** | FHIR R4 compatible | Healthcare standard |
| **Image Processing** | Sharp.js | Fast image optimization |

---

## 4. Week-by-Week Plan

### Week 5: Health Data Models & OCR Pipeline

**Days 1-2: FHIR-Compatible Schemas**
- [ ] Define health data models (FHIR R4 alignment)
- [ ] Create Firestore schemas for health context
- [ ] Implement VFS health adapters
- [ ] Add field-level encryption for PII

**Days 3-5: OCR Pipeline Setup**
- [ ] Setup Tesseract OCR service (Cloud Run)
- [ ] Implement PDF text extraction
- [ ] Add image preprocessing (Sharp.js)
- [ ] Create OCR result validation

**Days 6-7: Structured Data Extraction**
- [ ] Build Claude-based text parser
- [ ] Extract bloodwork metrics (cholesterol, glucose, etc.)
- [ ] Extract medication info (name, dosage, schedule)
- [ ] Create confidence scoring for extractions

**Deliverables:**
- ✅ Health schemas in VFS
- ✅ OCR service deployed
- ✅ Test suite for common lab results

---

### Week 6: @health/physician Agent

**Days 1-3: Agent Implementation**
- [ ] Create @health/physician manifest
- [ ] Write medical interpretation prompts
- [ ] Implement citation system (reference sources)
- [ ] Add disclaimer generation ("Always consult doctor")

**Days 4-5: Medical Knowledge Base**
- [ ] Curate medical reference ranges
- [ ] Add drug interaction database
- [ ] Implement RAG for medical guidelines
- [ ] Create symptom checker logic

**Days 6-7: Testing & Validation**
- [ ] Unit tests with sample lab results
- [ ] Edge cases (abnormal values, missing data)
- [ ] Medical accuracy review (with MD consultant)
- [ ] Cost optimization (prompt engineering)

**Deliverables:**
- ✅ @health/physician agent operational
- ✅ Medical knowledge base integrated
- ✅ Accuracy validation report

---

### Week 7: @health/nutritionist Agent

**Days 1-3: Agent Implementation**
- [ ] Create @health/nutritionist manifest
- [ ] Write dietary advice prompts
- [ ] Integrate food database (TACO Brazil)
- [ ] Implement meal plan generation

**Days 4-5: Health Integration**
- [ ] Connect to bloodwork context (cholesterol, glucose)
- [ ] Add dietary restrictions handling
- [ ] Implement calorie/macro calculations
- [ ] Create recipe suggestions

**Days 6-7: Testing**
- [ ] Unit tests with various health profiles
- [ ] Edge cases (allergies, restrictions)
- [ ] Nutritional accuracy validation
- [ ] User testing with beta group

**Deliverables:**
- ✅ @health/nutritionist agent operational
- ✅ Food database integrated
- ✅ Beta user feedback collected

---

### Week 8: Health Dashboard (Frontend)

**Days 1-2: Dashboard Layout**
- [ ] Create /dashboard/health route
- [ ] Design layout (cards, charts, timeline)
- [ ] Implement responsive design
- [ ] Add loading states

**Days 3-4: Metrics Visualization**
- [ ] Bloodwork metrics chart (line chart over time)
- [ ] Medication tracker (calendar view)
- [ ] Vitals dashboard (BP, HR, weight)
- [ ] Exam timeline (chronological list)

**Days 5-7: Interactions**
- [ ] Document upload flow (drag & drop)
- [ ] OCR processing progress indicator
- [ ] Ask physician feature (quick query)
- [ ] Export health summary (PDF)

**Deliverables:**
- ✅ Health dashboard deployed
- ✅ All visualizations working
- ✅ Mobile responsive

---

### Week 9: Medication Reminders (HOOKS)

**Days 1-2: HOOKS Infrastructure**
- [ ] Implement HOOKS runtime (Cloud Scheduler)
- [ ] Create HOOKS configuration schema
- [ ] Add trigger system (onSchedule, onContextUpdate)
- [ ] Build notification delivery

**Days 3-4: Medication Reminder Hook**
- [ ] Create medication_reminder hook
- [ ] Implement schedule parsing (daily, weekly, etc.)
- [ ] Add notification templates
- [ ] Implement snooze/dismiss logic

**Days 5-7: Advanced HOOKS**
- [ ] Exam followup hook (abnormal results)
- [ ] Medication refill reminder
- [ ] Annual checkup reminder
- [ ] Custom user-defined hooks

**Deliverables:**
- ✅ HOOKS system operational
- ✅ Medication reminders working
- ✅ User can configure hooks

---

### Week 10: Integration & Polish

**Days 1-3: End-to-End Flow**
- [ ] Full user journey testing
- [ ] CORE Agent → Health agents integration
- [ ] Dashboard → OCR → Agent flow
- [ ] Voice interface for health queries

**Days 4-5: Performance Optimization**
- [ ] OCR processing time optimization
- [ ] Dashboard load time optimization
- [ ] Agent response time tuning
- [ ] Cost per interaction review

**Days 6-7: Documentation**
- [ ] User guide (how to use health features)
- [ ] Medical disclaimer documentation
- [ ] Privacy policy update (health data)
- [ ] Developer documentation

**Deliverables:**
- ✅ All features integrated
- ✅ Performance benchmarks met
- ✅ Documentation complete

---

### Week 11: Beta Testing

**Days 1-2: Beta User Onboarding**
- [ ] Recruit 100 beta users
- [ ] Onboarding flow setup
- [ ] Sample data seeding (for demo)
- [ ] Beta feedback form

**Days 3-5: Bug Fixes & Iteration**
- [ ] Monitor error logs
- [ ] Fix critical bugs (P0)
- [ ] Address user feedback (P1)
- [ ] Performance tuning

**Days 6-7: Metrics Analysis**
- [ ] Analyze usage patterns
- [ ] Measure retention (D7)
- [ ] Calculate NPS
- [ ] Cost per user analysis

**Deliverables:**
- ✅ 100 active beta users
- ✅ Critical bugs fixed
- ✅ Metrics dashboard setup

---

### Week 12: Production Launch

**Days 1-2: Security Audit**
- [ ] Health data encryption audit
- [ ] Permission system review
- [ ] LGPD compliance check
- [ ] Penetration testing

**Days 3-4: Production Readiness**
- [ ] Load testing (1000 concurrent users)
- [ ] Disaster recovery test
- [ ] Monitoring alerts configured
- [ ] On-call rotation setup

**Days 5-7: Launch**
- [ ] Deploy to production
- [ ] Gradual rollout (10% → 50% → 100%)
- [ ] Monitor health metrics
- [ ] Launch announcement

**Deliverables:**
- ✅ Health vertical live in production
- ✅ Security audit passed
- ✅ Monitoring active

---

## 5. Implementation Backlog

### Task 1: FHIR-Compatible Health Schemas

**Priority:** P0
**Effort:** 1 day
**Owner:** Backend team

**Description:**
Define health data models aligned with FHIR R4 standard for interoperability.

**Implementation:**
```typescript
// packages/vfs/src/schemas/health.ts

export interface FHIRObservation {
  resourceType: 'Observation';
  id: string;
  status: 'final' | 'preliminary' | 'amended';
  category: ObservationCategory[];
  code: CodeableConcept;
  subject: Reference; // Patient
  effectiveDateTime: string; // ISO 8601
  valueQuantity?: Quantity;
  valueString?: string;
  interpretation?: CodeableConcept[];
  referenceRange?: ReferenceRange[];
  note?: Annotation[];
}

export interface Bloodwork {
  // NOUS simplified version (FHIR-compatible)
  id: string;
  date: Date;
  status: 'final' | 'preliminary';

  // Lipid panel
  cholesterol_total?: LabValue;
  cholesterol_hdl?: LabValue;
  cholesterol_ldl?: LabValue;
  triglycerides?: LabValue;

  // Glucose
  glucose_fasting?: LabValue;
  hba1c?: LabValue;

  // Complete blood count
  hemoglobin?: LabValue;
  hematocrit?: LabValue;
  white_blood_cells?: LabValue;
  platelets?: LabValue;

  // Liver function
  alt?: LabValue;
  ast?: LabValue;

  // Kidney function
  creatinine?: LabValue;
  urea?: LabValue;

  // Thyroid
  tsh?: LabValue;
  t4_free?: LabValue;

  // Metadata
  lab_name?: string;
  doctor?: string;
  notes?: string;

  // FHIR compatibility
  fhir_observations?: FHIRObservation[];
}

export interface LabValue {
  value: number;
  unit: string;
  reference_range: {
    low: number;
    high: number;
  };
  interpretation?: 'normal' | 'high' | 'low' | 'critical';
}

export interface Medication {
  id: string;
  name: string;
  active_ingredient: string;
  dosage: string; // "10mg"
  frequency: string; // "1x ao dia"
  schedule: MedicationSchedule;
  start_date: Date;
  end_date?: Date;
  prescribing_doctor?: string;
  indication: string; // "Hipertensão"
  side_effects?: string[];
  interactions?: string[];
  refill_reminder_days?: number; // Days before running out

  // FHIR compatibility
  fhir_medication_request?: any;
}

export interface MedicationSchedule {
  type: 'daily' | 'weekly' | 'monthly' | 'as_needed';
  times?: string[]; // ["09:00", "21:00"]
  days_of_week?: number[]; // [0, 1, 2, 3, 4, 5, 6]
  day_of_month?: number;
}

export interface Exam {
  id: string;
  type: 'bloodwork' | 'imaging' | 'biopsy' | 'other';
  category: string; // "Cardiologia", "Endocrinologia"
  name: string;
  date: Date;
  results_summary: string;
  interpretation?: string;
  abnormal_findings?: string[];
  follow_up_required?: boolean;
  doctor?: string;
  facility?: string;

  // Structured results (if bloodwork)
  bloodwork?: Bloodwork;

  // Documents
  document_ids: string[]; // References to VAULT:health/exams/*

  // FHIR compatibility
  fhir_diagnostic_report?: any;
}
```

**Acceptance Criteria:**
- [ ] All health schemas defined and exported
- [ ] FHIR observation mapping documented
- [ ] Unit tests for schema validation
- [ ] TypeScript types generated

---

### Task 2: OCR Pipeline Implementation

**Priority:** P0
**Effort:** 3 days
**Owner:** ML/Backend team

**Description:**
Build pipeline to extract text from medical PDFs and images, then structure data using Claude.

**Implementation:**
```typescript
// packages/ocr/src/medical-ocr.ts

import Tesseract from 'tesseract.js';
import { Anthropic } from '@anthropic-ai/sdk';
import sharp from 'sharp';

export class MedicalOCRService {
  private tesseract: Tesseract.Worker;
  private claude: Anthropic;

  async processDocument(
    file: Buffer,
    type: 'pdf' | 'image',
    userId: string
  ): Promise<OCRResult> {
    // 1. Preprocess
    const preprocessed = await this.preprocessImage(file, type);

    // 2. Extract text (Tesseract)
    const rawText = await this.extractText(preprocessed);

    // 3. Structure data (Claude)
    const structured = await this.structureData(rawText, userId);

    // 4. Validate & score confidence
    const validated = await this.validateResults(structured);

    return {
      raw_text: rawText,
      structured_data: validated.data,
      confidence: validated.confidence,
      extracted_at: new Date()
    };
  }

  /**
   * Preprocess image for better OCR accuracy
   */
  private async preprocessImage(
    file: Buffer,
    type: 'pdf' | 'image'
  ): Promise<Buffer> {
    if (type === 'pdf') {
      // Convert PDF to images (one per page)
      // Use pdf-poppler or similar
      // For now, assume single page
    }

    // Image enhancement
    return await sharp(file)
      .greyscale() // Convert to grayscale
      .normalize() // Normalize contrast
      .sharpen() // Sharpen edges
      .resize({ width: 2000, withoutEnlargement: true }) // Standardize size
      .png() // Convert to PNG
      .toBuffer();
  }

  /**
   * Extract text using Tesseract OCR
   */
  private async extractText(image: Buffer): Promise<string> {
    const result = await this.tesseract.recognize(image, {
      lang: 'por+eng', // Portuguese + English
      tessedit_pageseg_mode: Tesseract.PSM.AUTO
    });

    return result.data.text;
  }

  /**
   * Structure extracted text using Claude
   */
  private async structureData(
    rawText: string,
    userId: string
  ): Promise<StructuredHealthData> {
    const response = await this.claude.messages.create({
      model: 'claude-sonnet-4',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Extract structured health data from this medical document:

${rawText}

Extract ALL of the following (if present):
1. Document type (bloodwork, prescription, medical report)
2. Patient name
3. Date of exam/report
4. Lab/clinic name
5. Doctor name
6. All lab values with:
   - Test name
   - Value + unit
   - Reference range
   - Interpretation (if marked as high/low)
7. Medications with dosage and frequency
8. Diagnoses or findings
9. Recommendations or follow-up instructions

Return as JSON following this schema:
{
  "document_type": "bloodwork" | "prescription" | "medical_report",
  "date": "YYYY-MM-DD",
  "patient_name": string,
  "lab_name": string,
  "doctor": string,
  "bloodwork": {
    "cholesterol_total": { "value": number, "unit": string, "reference": {"low": number, "high": number} },
    ...
  },
  "medications": [
    { "name": string, "dosage": string, "frequency": string }
  ],
  "findings": string,
  "recommendations": string
}

Be precise. If a field is not found, use null. Preserve exact values.`
      }]
    });

    const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Claude response');
    }

    return JSON.parse(jsonMatch[0]);
  }

  /**
   * Validate extracted data and score confidence
   */
  private async validateResults(
    data: StructuredHealthData
  ): Promise<{ data: StructuredHealthData; confidence: number }> {
    let confidence = 1.0;

    // Check required fields
    if (!data.document_type) confidence *= 0.5;
    if (!data.date) confidence *= 0.7;

    // Validate date format
    if (data.date && !this.isValidDate(data.date)) {
      confidence *= 0.6;
    }

    // Validate lab values (reasonable ranges)
    if (data.bloodwork) {
      for (const [key, value] of Object.entries(data.bloodwork)) {
        if (value && !this.isReasonableLabValue(key, value.value)) {
          confidence *= 0.8;
        }
      }
    }

    return { data, confidence };
  }

  private isValidDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return !isNaN(date.getTime()) && date < new Date();
  }

  private isReasonableLabValue(testName: string, value: number): boolean {
    // Simple sanity checks
    const ranges: Record<string, [number, number]> = {
      cholesterol_total: [100, 400],
      glucose_fasting: [50, 300],
      hemoglobin: [8, 20],
      // ... more ranges
    };

    const range = ranges[testName];
    if (!range) return true; // Unknown test, assume OK

    return value >= range[0] && value <= range[1];
  }
}

interface OCRResult {
  raw_text: string;
  structured_data: StructuredHealthData;
  confidence: number;
  extracted_at: Date;
}

interface StructuredHealthData {
  document_type: 'bloodwork' | 'prescription' | 'medical_report';
  date: string;
  patient_name?: string;
  lab_name?: string;
  doctor?: string;
  bloodwork?: any;
  medications?: any[];
  findings?: string;
  recommendations?: string;
}
```

**Acceptance Criteria:**
- [ ] OCR service deployed on Cloud Run
- [ ] Can process PDF and image files
- [ ] Extracts common lab tests (>90% accuracy)
- [ ] Confidence scoring implemented
- [ ] Processing time < 30 seconds per document

---

### Task 3: @health/physician Agent

**Priority:** P0
**Effort:** 3 days
**Owner:** AI/Agent team

**Description:**
Create medical interpretation agent that analyzes health data and provides expert insights.

**Implementation:**
```python
# agents/health/physician/main.py

from anthropic import Anthropic
import json

PHYSICIAN_SYSTEM_PROMPT = """You are a medical AI assistant integrated into NOUS OS, a personal operating system for life.

## Your Role
You provide medical information and analysis based on the user's health data. You ARE NOT a replacement for a licensed physician.

## Capabilities
- Interpret lab results and explain what values mean
- Identify abnormal values and explain implications
- Suggest questions to ask doctor
- Provide general health education
- Reference medical guidelines and sources

## Critical Rules
1. **Never diagnose** - You can explain patterns but cannot diagnose conditions
2. **Never prescribe** - You cannot recommend specific medications or treatments
3. **Always cite sources** - Reference medical guidelines or ranges
4. **Flag emergencies** - If values suggest emergency (chest pain, extreme values), urge immediate medical attention
5. **Encourage doctor visits** - For any abnormal findings, recommend consulting physician
6. **Respect uncertainty** - Be clear when you don't have enough information

## Output Format
Structure your responses as:
1. **Summary** - Quick overview (1-2 sentences)
2. **Detailed Analysis** - Explain each relevant value
3. **What This Means** - Practical implications
4. **Recommendations** - What user should do (usually: consult doctor)
5. **Questions for Doctor** - Suggested questions to ask

Always end with: "⚕️ This is informational only. Always consult your licensed physician for medical advice."
"""

class HealthPhysicianAgent:
    def __init__(self):
        self.claude = Anthropic(api_key=ANTHROPIC_API_KEY)
        self.model = "claude-opus-4"  # Best medical reasoning

    async def analyze_bloodwork(
        self,
        bloodwork: dict,
        user_context: dict,
        query: str
    ) -> dict:
        """Analyzes bloodwork and answers user query"""

        # Build context
        context_str = self._build_context(bloodwork, user_context)

        # Call Claude
        response = await self.claude.messages.create({
            model=self.model,
            max_tokens=2000,
            system=PHYSICIAN_SYSTEM_PROMPT,
            messages=[{
                role: "user",
                content: f"""User Question: {query}

Health Data:
{context_str}

Provide a thorough but accessible analysis following the output format specified in your instructions."""
            }]
        })

        # Parse response
        analysis = response.content[0].text

        # Extract structured info
        structured = self._extract_structured(analysis)

        return {
            "response": analysis,
            "structured": structured,
            "citations": self._extract_citations(analysis),
            "urgency": self._assess_urgency(bloodwork),
            "cost": self._calculate_cost(response)
        }

    def _build_context(self, bloodwork: dict, user_context: dict) -> str:
        """Formats bloodwork data for Claude"""

        lines = []
        lines.append(f"Date: {bloodwork.get('date')}")
        lines.append(f"Lab: {bloodwork.get('lab_name', 'Unknown')}\n")

        # Lipid panel
        if 'cholesterol_total' in bloodwork:
            lines.append("**Lipid Panel:**")
            self._add_lab_value(lines, "Total Cholesterol", bloodwork.get('cholesterol_total'))
            self._add_lab_value(lines, "HDL (Good)", bloodwork.get('cholesterol_hdl'))
            self._add_lab_value(lines, "LDL (Bad)", bloodwork.get('cholesterol_ldl'))
            self._add_lab_value(lines, "Triglycerides", bloodwork.get('triglycerides'))
            lines.append("")

        # Glucose
        if 'glucose_fasting' in bloodwork:
            lines.append("**Glucose:**")
            self._add_lab_value(lines, "Fasting Glucose", bloodwork.get('glucose_fasting'))
            self._add_lab_value(lines, "HbA1c", bloodwork.get('hba1c'))
            lines.append("")

        # Add user context (age, medications, conditions)
        if user_context:
            lines.append("**User Context:**")
            if 'age' in user_context:
                lines.append(f"- Age: {user_context['age']}")
            if 'medications' in user_context:
                lines.append(f"- Current medications: {', '.join(user_context['medications'])}")
            if 'conditions' in user_context:
                lines.append(f"- Known conditions: {', '.join(user_context['conditions'])}")

        return '\n'.join(lines)

    def _add_lab_value(self, lines: list, name: str, value: dict):
        """Formats a single lab value"""
        if not value:
            return

        val = value.get('value')
        unit = value.get('unit')
        ref = value.get('reference_range', {})
        interp = value.get('interpretation', 'normal')

        indicator = "✅" if interp == 'normal' else "⚠️" if interp in ['high', 'low'] else "🚨"

        ref_str = f"(ref: {ref.get('low')}-{ref.get('high')} {unit})" if ref else ""

        lines.append(f"  {indicator} {name}: {val} {unit} {ref_str}")

    def _assess_urgency(self, bloodwork: dict) -> str:
        """Assess urgency level based on values"""

        # Critical values
        critical_conditions = [
            ('glucose_fasting', lambda v: v > 400 or v < 40),
            ('cholesterol_total', lambda v: v > 400),
            ('creatinine', lambda v: v > 5.0),
        ]

        for test, check in critical_conditions:
            value = bloodwork.get(test, {}).get('value')
            if value and check(value):
                return 'critical'  # Seek immediate medical attention

        # Check for multiple abnormal values
        abnormal_count = sum(
            1 for v in bloodwork.values()
            if isinstance(v, dict) and v.get('interpretation') in ['high', 'low']
        )

        if abnormal_count >= 3:
            return 'high'  # Schedule doctor appointment soon

        if abnormal_count >= 1:
            return 'medium'  # Discuss with doctor at next visit

        return 'low'  # All normal

    def _extract_citations(self, analysis: str) -> list:
        """Extract citations/sources from response"""
        # Simple regex to find references
        import re
        citations = re.findall(r'\[([^\]]+)\]', analysis)
        return citations

    def _calculate_cost(self, response) -> float:
        """Calculate API cost"""
        input_tokens = response.usage.input_tokens
        output_tokens = response.usage.output_tokens

        # Claude Opus pricing (as of 2025)
        cost = (input_tokens * 0.000015) + (output_tokens * 0.000075)
        return round(cost, 4)
```

**Manifest:**
```yaml
# agents/health/physician/manifest.yml

agent_id: "@health/physician"
name: "Health Physician"
version: "1.0.0"
description: "Medical interpretation and health analysis expert"

capabilities:
  - "Interpret lab results"
  - "Explain health metrics"
  - "Identify abnormalities"
  - "Suggest doctor questions"

permissions_required:
  - read_health_data
  - read_profile_health

model:
  primary: claude-opus-4
  fallback: claude-sonnet-4

cost_estimate:
  avg_per_call: "$0.15"

safety:
  disclaimers:
    - "Not a licensed physician"
    - "For informational purposes only"
    - "Always consult your doctor"

  forbidden_actions:
    - "diagnose"
    - "prescribe"
    - "replace_doctor"

metadata:
  category: "health"
  complexity: "high"
  response_time: "10-30 seconds"
```

**Acceptance Criteria:**
- [ ] Agent analyzes bloodwork correctly
- [ ] Provides actionable insights
- [ ] Always includes medical disclaimer
- [ ] Flags critical values appropriately
- [ ] Cost per analysis < $0.20

---

### Task 4: Health Dashboard Implementation

**Priority:** P0
**Effort:** 5 days
**Owner:** Frontend team

**Description:**
Build comprehensive health dashboard showing metrics, trends, and documents.

**Implementation:**
```typescript
// apps/lens/app/dashboard/health/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useHealthData } from '@/hooks/useHealthData';

export default function HealthDashboard() {
  const { bloodwork, medications, exams, vitals, loading } = useHealthData();

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Health Dashboard</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Latest Cholesterol"
          value={bloodwork?.latest?.cholesterol_total?.value}
          unit="mg/dL"
          status={bloodwork?.latest?.cholesterol_total?.interpretation}
          trend={calculateTrend(bloodwork?.history, 'cholesterol_total')}
        />
        <StatCard
          title="Fasting Glucose"
          value={bloodwork?.latest?.glucose_fasting?.value}
          unit="mg/dL"
          status={bloodwork?.latest?.glucose_fasting?.interpretation}
        />
        <StatCard
          title="Active Medications"
          value={medications?.active?.length || 0}
          unit="meds"
        />
        <StatCard
          title="Next Exam"
          value={exams?.upcoming?.[0]?.name}
          subtitle={formatDate(exams?.upcoming?.[0]?.date)}
        />
      </div>

      {/* Bloodwork Trends */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Cholesterol Trends</h2>
        <LineChart width={800} height={300} data={bloodwork?.history || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="cholesterol_total"
            stroke="#8884d8"
            name="Total"
          />
          <Line
            type="monotone"
            dataKey="cholesterol_hdl"
            stroke="#82ca9d"
            name="HDL (Good)"
          />
          <Line
            type="monotone"
            dataKey="cholesterol_ldl"
            stroke="#ffc658"
            name="LDL (Bad)"
          />
        </LineChart>
      </div>

      {/* Medication Tracker */}
      <MedicationTracker medications={medications} />

      {/* Exam Timeline */}
      <ExamTimeline exams={exams} />

      {/* Document Upload */}
      <DocumentUploader />
    </div>
  );
}

function StatCard({ title, value, unit, status, trend, subtitle }) {
  const statusColors = {
    normal: 'text-green-600',
    high: 'text-yellow-600',
    low: 'text-yellow-600',
    critical: 'text-red-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${statusColors[status] || 'text-gray-900'}`}>
        {value} {unit && <span className="text-sm font-normal">{unit}</span>}
      </p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      {trend && (
        <p className="text-xs text-gray-400 mt-1">
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
        </p>
      )}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Dashboard loads in < 2 seconds
- [ ] All charts render correctly
- [ ] Mobile responsive
- [ ] Real-time data updates
- [ ] Accessible (WCAG AA)

---

### Task 5: Medication Reminder HOOKS

**Priority:** P1
**Effort:** 2 days
**Owner:** Backend team

**Description:**
Implement HOOKS system for proactive medication reminders.

**Implementation:**
```typescript
// packages/hooks/src/medication-reminder.ts

export class MedicationReminderHook {
  /**
   * Triggered daily at configured times to check for due medications
   */
  async execute(userId: string, config: HookConfig): Promise<HookResult> {
    // 1. Get user's medications
    const medications = await this.vfs.read(
      `context:health.medications`,
      userId
    );

    // 2. Check which are due now
    const now = new Date();
    const dueMeds = medications.filter(med =>
      this.isDueNow(med, now)
    );

    if (dueMeds.length === 0) {
      return { action: 'none', message: 'No medications due' };
    }

    // 3. Send notifications
    for (const med of dueMeds) {
      await this.notifications.send(userId, {
        title: '💊 Medication Reminder',
        body: `Time to take ${med.name} (${med.dosage})`,
        action: {
          type: 'mark_taken',
          medication_id: med.id
        },
        priority: 'high',
        sound: 'medication_bell.mp3'
      });
    }

    // 4. Log execution
    await this.logger.info('Medication reminder sent', {
      userId,
      medications_count: dueMeds.length
    });

    return {
      action: 'notifications_sent',
      count: dueMeds.length
    };
  }

  private isDueNow(medication: Medication, now: Date): boolean {
    const schedule = medication.schedule;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    if (schedule.type === 'daily') {
      // Check if current time matches any scheduled time (±5 minutes)
      return schedule.times?.some(time =>
        this.isTimeMatch(currentTime, time, 5)
      ) || false;
    }

    // Handle other schedule types...
    return false;
  }

  private isTimeMatch(current: string, scheduled: string, toleranceMinutes: number): boolean {
    const [currH, currM] = current.split(':').map(Number);
    const [schedH, schedM] = scheduled.split(':').map(Number);

    const currTotal = currH * 60 + currM;
    const schedTotal = schedH * 60 + schedM;

    return Math.abs(currTotal - schedTotal) <= toleranceMinutes;
  }
}
```

**Hook Configuration:**
```yaml
# hooks/medication_reminder.yml

hook_id: "medication_reminder"
name: "Medication Reminder"
description: "Sends notifications when medications are due"

trigger:
  type: onSchedule
  cron: "*/5 * * * *"  # Every 5 minutes

permissions:
  - read_health_data
  - send_notifications

user_configurable:
  enabled: true
  schedule_override: true
  notification_preferences: true

default_config:
  enabled: true
  snooze_duration_minutes: 15
  max_snoozes: 3
```

**Acceptance Criteria:**
- [ ] Reminders sent at correct times
- [ ] Users can snooze/dismiss
- [ ] Track adherence (% taken on time)
- [ ] Works with all schedule types

---

## 6. Technical Design Decisions

### 6.1 Why FHIR Compatibility?

**Decision:** Align health data models with FHIR R4 standard.

**Rationale:**
- **Interoperability:** Future integrations with EHR systems, labs, hospitals
- **Best Practices:** Proven healthcare data models
- **Regulatory:** Easier compliance with health data regulations
- **Future-proof:** Industry standard, widely adopted

**Trade-offs:**
- More complex schemas than needed initially
- Learning curve for team

**Mitigation:**
- Create simplified NOUS schemas that map to FHIR
- Hide complexity from users
- Document mapping clearly

---

### 6.2 OCR: Tesseract vs Cloud Vision API

**Decision:** Use Tesseract (open-source) instead of Google Cloud Vision API.

**Comparison:**

| Aspect | Tesseract | Cloud Vision API |
|--------|-----------|------------------|
| **Cost** | Free | $1.50 per 1000 pages |
| **Accuracy** | 85-90% (medical docs) | 95%+ |
| **Privacy** | Self-hosted | Sends to Google |
| **Customization** | Full control | Limited |
| **Portuguese** | Good support | Excellent |

**Rationale:**
- **Privacy:** Medical documents are extremely sensitive - self-hosting preferred
- **Cost:** At scale (1000 users × 5 docs/month = 5K docs), Cloud Vision = $7.50/month saved
- **Accuracy gap:** Claude post-processing can improve Tesseract output

**Mitigation:**
- Invest in image preprocessing to boost Tesseract accuracy
- Use Claude to correct common OCR errors
- Provide manual correction UI for low-confidence extractions

---

### 6.3 Agent Model Selection

**Decision:** Use Claude Opus for @health/physician (not Sonnet).

**Rationale:**
- **Medical accuracy:** Opus has better reasoning for complex medical questions
- **Liability:** Wrong medical info is high-risk - worth extra cost
- **User trust:** Health is critical domain - use best model

**Cost Impact:**
```
Sonnet: $3/$15 per 1M tokens (input/output)
Opus: $15/$75 per 1M tokens

Typical health query:
- Input: 1K tokens (context + query)
- Output: 500 tokens (analysis)

Sonnet: $0.011 per query
Opus: $0.053 per query

Delta: $0.042 per query

At 1000 users × 10 queries/month = 10K queries
Extra cost: $420/month

Revenue impact: $19/month × 1000 users = $19,000
Cost as % of revenue: 2.2% ← Acceptable
```

**Decision:** Worth it for quality and trust.

---

### 6.4 HOOKS: Event-Driven vs Polling

**Decision:** Use Cloud Scheduler (cron) for medication reminders, not real-time event triggers.

**Rationale:**
- **Predictable:** Medications are time-based, not event-based
- **Simpler:** Cron is easier than complex event system
- **Reliable:** Cloud Scheduler has 99.9% SLA
- **Cost:** Fixed cost vs per-event billing

**Alternative considered:** Firestore triggers on medication updates
- Rejected because: Medications rarely change, but reminders need to run multiple times per day

---

## 7. Success Criteria

### Phase 1 is complete when:

#### Technical Criteria
- [ ] ✅ OCR processes 90%+ of common lab results correctly
- [ ] ✅ @health/physician agent accuracy validated by MD
- [ ] ✅ @health/nutritionist agent provides sensible meal plans
- [ ] ✅ Health dashboard loads in < 2 seconds
- [ ] ✅ Medication reminders sent within 1 minute of scheduled time
- [ ] ✅ All health data encrypted at rest
- [ ] ✅ LGPD-compliant consent flow for health data

#### Functional Criteria
- [ ] ✅ User can upload lab result PDF → See structured data in < 30 seconds
- [ ] ✅ User can ask "Is my cholesterol normal?" → Get expert answer
- [ ] ✅ User receives medication reminder → Can mark as taken/snoozed
- [ ] ✅ User can view health trends over time
- [ ] ✅ User can export health summary PDF

#### User Metrics
- [ ] ✅ 100+ beta users actively using health features
- [ ] ✅ D7 retention > 70% (users return after 7 days)
- [ ] ✅ NPS > 50 (Net Promoter Score)
- [ ] ✅ Avg 5+ interactions per user per week

#### Cost Metrics
- [ ] ✅ Cost per user < $3/month (target: $2.50)
- [ ] ✅ OCR cost < $0.10 per document
- [ ] ✅ Agent cost < $0.20 per query

---

## 8. Dependencies

### Prerequisites from Phase 0
- ✅ VFS (Virtual File System) operational
- ✅ CONTEXT schemas defined
- ✅ Security middleware active
- ✅ Encryption service deployed
- ✅ CORE Agent basic functionality
- ✅ Frontend (LENS) deployed

### External Dependencies
- **Tesseract OCR:** Version 5.0+ with Portuguese language pack
- **Medical Reference Data:** Lab normal ranges database
- **Food Database:** TACO (Brazilian Food Composition Table)
- **FHIR Spec:** R4 documentation for data mapping

### Team Dependencies
- **Medical Advisor:** MD consultant for accuracy validation (1-2 days)
- **Design:** UI/UX for health dashboard (ongoing)
- **DevOps:** Cloud Run deployment for OCR service (1 day)

### Risk Mitigation
- **OCR Accuracy:** Fallback to manual correction UI if confidence < 80%
- **Medical Liability:** Clear disclaimers + legal review of agent responses
- **Beta User Recruitment:** Partner with health communities, offer free tier
- **Cost Overruns:** Monitor daily, set budget alerts at $5K/month

---

## Summary

**Phase 1 delivers the Health Vertical - NOUS OS's first specialized domain.**

Key achievements:
- 🏥 Users can manage health data with AI assistance
- 📊 Comprehensive health dashboard with trends
- 💊 Proactive medication reminders
- 📄 Automatic medical document processing
- 🤖 Expert health analysis from AI agents

**Timeline:** 8 weeks (Weeks 5-12)
**Team:** 4-6 engineers (2 backend, 2 frontend, 1 ML, 1 QA)
**Budget:** ~$10K (infrastructure + APIs)

**Next:** Phase 2 - Finance Vertical (Weeks 13-18)

---

**Document Status:** ✅ Complete
**Ready for:** Implementation kickoff

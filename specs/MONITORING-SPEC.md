# NOUS OS - Monitoring & Observability Specification

> **Version:** 1.0.0
> **Last Updated:** 2025-01-19
> **Status:** Production Critical - Must Complete Before Launch
> **Applies To:** All Phases

---

## 📋 Table of Contents

1. [Overview](#1-overview)
2. [Monitoring Stack](#2-monitoring-stack)
3. [Metrics & Dashboards](#3-metrics--dashboards)
4. [Logging](#4-logging)
5. [Alerting](#5-alerting)
6. [SLOs & SLIs](#6-slos--slis)
7. [Incident Response](#7-incident-response)
8. [Implementation Guide](#8-implementation-guide)

---

## 1. Overview

### Why Monitoring Matters

- **Reliability:** Detect and fix issues before users notice
- **Performance:** Identify bottlenecks and optimize
- **Cost:** Track spending and prevent overages
- **Security:** Detect anomalies and breaches
- **Business:** Measure user engagement and growth

### Observability Pillars

1. **Metrics:** Time-series data (CPU, memory, request rate)
2. **Logs:** Event records (errors, user actions, API calls)
3. **Traces:** Request paths through system (distributed tracing)
4. **Dashboards:** Visual representation of system health

### Goals

- **99.9% uptime** (43 minutes downtime per month allowed)
- **P95 latency <2 seconds** (API responses)
- **Alert fatigue minimization** (only actionable alerts)
- **5-minute MTTD** (Mean Time To Detection)
- **15-minute MTTR** (Mean Time To Resolution for P0)

---

## 2. Monitoring Stack

### Technology Choices

| Component | Technology | Why |
|-----------|-----------|-----|
| **Metrics** | Google Cloud Monitoring | Native GCP integration |
| **Logging** | Cloud Logging + Elasticsearch | Structured logs + full-text search |
| **Dashboards** | Grafana + Cloud Console | Customizable + pre-built |
| **Alerting** | Cloud Monitoring Alerts + PagerDuty | Multi-channel notifications |
| **Tracing** | OpenTelemetry + Cloud Trace | Industry standard |
| **APM** | Optional: New Relic/Datadog | Deep application insights |
| **Uptime Monitoring** | Pingdom or StatusCake | External health checks |

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  NOUS OS Services                       │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐          │
│  │ Frontend  │  │  CORE     │  │  Agents   │          │
│  │ (Next.js) │  │  Agent    │  │ (Python)  │          │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘          │
│        │              │              │                  │
│        └──────────────┼──────────────┘                  │
│                       ↓                                 │
│              ┌─────────────────┐                        │
│              │ OpenTelemetry   │                        │
│              │ Collector       │                        │
│              └────────┬────────┘                        │
└───────────────────────┼─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
┌───────────────┐ ┌─────────────┐ ┌────────────┐
│ Cloud         │ │ Cloud       │ │ Cloud      │
│ Monitoring    │ │ Logging     │ │ Trace      │
│ (Metrics)     │ │ (Logs)      │ │ (Traces)   │
└───────┬───────┘ └──────┬──────┘ └─────┬──────┘
        │                │              │
        └────────────────┼──────────────┘
                         ↓
                ┌─────────────────┐
                │    Grafana      │
                │  (Dashboards)   │
                └────────┬────────┘
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
┌───────────────┐ ┌──────────────┐ ┌─────────────┐
│ Cloud         │ │  PagerDuty   │ │   Slack     │
│ Monitoring    │ │  (On-call)   │ │ (Warnings)  │
│ Alerts        │ │              │ │             │
└───────────────┘ └──────────────┘ └─────────────┘
```

---

## 3. Metrics & Dashboards

### 3.1 Key Metrics

**System Metrics:**
```yaml
infrastructure:
  - cpu_usage (%)
  - memory_usage (%)
  - disk_usage (%)
  - network_throughput (MB/s)
  - active_connections

containers:
  - cloud_run_instance_count
  - cloud_run_request_count
  - cloud_run_billable_time
  - cold_start_count
  - cold_start_latency

database:
  - firestore_read_ops
  - firestore_write_ops
  - firestore_document_count
  - firestore_storage_size
```

**Application Metrics:**
```yaml
api:
  - request_count (by endpoint)
  - request_latency (p50, p95, p99)
  - error_rate (%)
  - success_rate (%)

agents:
  - agent_execution_count (by agent)
  - agent_execution_latency
  - agent_success_rate
  - agent_cost_usd

llm:
  - llm_api_calls (by provider)
  - llm_tokens_used (input/output)
  - llm_cost_usd
  - llm_latency

cache:
  - cache_hit_rate (%)
  - cache_miss_rate (%)
  - redis_memory_usage
```

**Business Metrics:**
```yaml
users:
  - active_users_daily
  - active_users_weekly
  - active_users_monthly
  - new_signups
  - churn_rate

engagement:
  - conversations_per_user
  - agent_calls_per_user
  - sessions_per_user
  - session_duration

revenue:
  - mrr (Monthly Recurring Revenue)
  - arr (Annual Recurring Revenue)
  - revenue_per_user
  - platform_gmv (marketplace)
```

### 3.2 Dashboard: System Health

```yaml
# Grafana Dashboard Definition

dashboard:
  name: "NOUS - System Health"
  refresh: "30s"

  rows:
    - name: "Overview"
      panels:
        - type: "stat"
          title: "Uptime (7d)"
          query: "avg(up{job='nous-api'}) OVER 7d * 100"
          unit: "%"
          thresholds: [99.9, 99.5, 99.0]

        - type: "stat"
          title: "Request Rate"
          query: "sum(rate(http_requests_total[5m]))"
          unit: "reqps"

        - type: "stat"
          title: "P95 Latency"
          query: "histogram_quantile(0.95, http_request_duration_seconds)"
          unit: "s"
          thresholds: [2.0, 3.0, 5.0]

        - type: "stat"
          title: "Error Rate"
          query: "sum(rate(http_requests_total{status=~'5..'}[5m])) / sum(rate(http_requests_total[5m])) * 100"
          unit: "%"
          thresholds: [1.0, 5.0, 10.0]

    - name: "API Endpoints"
      panels:
        - type: "graph"
          title: "Requests by Endpoint"
          query: "sum(rate(http_requests_total[5m])) by (endpoint)"
          legend: true

        - type: "graph"
          title: "Latency by Endpoint (P95)"
          query: "histogram_quantile(0.95, http_request_duration_seconds) by (endpoint)"

    - name: "Infrastructure"
      panels:
        - type: "graph"
          title: "Cloud Run Instances"
          query: "cloud_run_instance_count"

        - type: "graph"
          title: "CPU Usage"
          query: "avg(cpu_usage) by (service)"
          unit: "%"

        - type: "graph"
          title: "Memory Usage"
          query: "avg(memory_usage) by (service)"
          unit: "MB"

    - name: "Database"
      panels:
        - type: "graph"
          title: "Firestore Operations"
          queries:
            - "sum(rate(firestore_reads[5m]))"
            - "sum(rate(firestore_writes[5m]))"

        - type: "stat"
          title: "Document Count"
          query: "firestore_document_count"
          unit: "short"
```

### 3.3 Dashboard: Agent Performance

```yaml
dashboard:
  name: "NOUS - Agent Performance"

  rows:
    - name: "Agent Usage"
      panels:
        - type: "bar_chart"
          title: "Executions by Agent (24h)"
          query: "sum(agent_executions_total) by (agent_id) OVER 24h"

        - type: "table"
          title: "Top Agents"
          columns:
            - "Agent Name"
            - "Executions"
            - "Avg Latency"
            - "Success Rate"
            - "Cost"

    - name: "LLM Usage"
      panels:
        - type: "graph"
          title: "LLM API Calls"
          query: "sum(rate(llm_api_calls[5m])) by (provider)"

        - type: "graph"
          title: "Token Usage"
          queries:
            - "sum(rate(llm_tokens_input[5m]))"
            - "sum(rate(llm_tokens_output[5m]))"

        - type: "stat"
          title: "LLM Cost (Today)"
          query: "sum(llm_cost_usd) OVER 24h"
          unit: "$"

    - name: "Cache Performance"
      panels:
        - type: "graph"
          title: "Cache Hit Rate"
          query: "cache_hits / (cache_hits + cache_misses) * 100"
          unit: "%"
```

### 3.4 Dashboard: Business Metrics

```yaml
dashboard:
  name: "NOUS - Business Metrics"

  rows:
    - name: "Users"
      panels:
        - type: "graph"
          title: "DAU/MAU"
          queries:
            - "count(distinct(user_id)) OVER 1d"  # DAU
            - "count(distinct(user_id)) OVER 30d" # MAU

        - type: "stat"
          title: "New Signups (Today)"
          query: "sum(new_signups) OVER 1d"

        - type: "graph"
          title: "Retention Cohort"
          # Complex query showing D1, D7, D30 retention

    - name: "Revenue"
      panels:
        - type: "stat"
          title: "MRR"
          query: "sum(subscription_value) WHERE status='active'"
          unit: "$"

        - type: "graph"
          title: "Revenue Growth"
          query: "sum(subscription_value) by month"

        - type: "table"
          title: "Revenue by Product"
          columns: ["Product", "Subscribers", "MRR"]
```

---

## 4. Logging

### 4.1 Log Levels

```typescript
export enum LogLevel {
  DEBUG = 0,   // Verbose, development only
  INFO = 1,    // Normal operations
  WARN = 2,    // Potential issues
  ERROR = 3,   // Errors that need attention
  CRITICAL = 4 // System-critical failures
}
```

### 4.2 Structured Logging

**Log Format (JSON):**
```json
{
  "timestamp": "2025-01-19T10:30:45.123Z",
  "level": "INFO",
  "service": "core-agent",
  "message": "Agent execution completed",
  "context": {
    "user_id": "user_abc123",
    "session_id": "sess_xyz789",
    "agent_id": "@health/physician",
    "execution_time_ms": 1234,
    "cost_usd": 0.15
  },
  "trace_id": "abcdef123456", // For distributed tracing
  "span_id": "span_abc123"
}
```

**Logger Implementation:**
```typescript
// packages/logging/src/logger.ts

import { CloudLogging } from '@google-cloud/logging';

export class Logger {
  private cloudLogging: CloudLogging;
  private serviceName: string;

  constructor(serviceName: string) {
    this.cloudLogging = new CloudLogging();
    this.serviceName = serviceName;
  }

  info(message: string, context?: any) {
    this.log('INFO', message, context);
  }

  warn(message: string, context?: any) {
    this.log('WARN', message, context);
  }

  error(message: string, error?: Error, context?: any) {
    this.log('ERROR', message, {
      ...context,
      error: {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      }
    });
  }

  critical(message: string, error?: Error, context?: any) {
    this.log('CRITICAL', message, {
      ...context,
      error: {
        message: error?.message,
        stack: error?.stack
      }
    });

    // Also send to PagerDuty
    this.sendToPagerDuty({
      severity: 'critical',
      title: message,
      details: context
    });
  }

  private log(level: string, message: string, context?: any) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      context,
      trace_id: this.getTraceId(),
      span_id: this.getSpanId()
    };

    // Log to console (for local development)
    if (process.env.NODE_ENV === 'development') {
      console.log(JSON.stringify(entry, null, 2));
    }

    // Send to Cloud Logging
    this.cloudLogging.log(this.serviceName).write(entry);
  }
}
```

### 4.3 Log Categories

**Security Logs:**
```json
{
  "category": "security",
  "event": "failed_login",
  "user_id": "user_123",
  "ip_address": "192.168.1.1",
  "attempts": 3,
  "timestamp": "2025-01-19T10:30:45Z"
}
```

**Agent Execution Logs:**
```json
{
  "category": "agent",
  "event": "execution_complete",
  "agent_id": "@health/physician",
  "user_id": "user_123",
  "execution_time_ms": 1234,
  "cost_usd": 0.15,
  "success": true
}
```

**Financial Transaction Logs:**
```json
{
  "category": "finance",
  "event": "subscription_created",
  "user_id": "user_123",
  "subscription_id": "sub_xyz",
  "amount_usd": 19.00,
  "payment_method": "card_4242"
}
```

---

## 5. Alerting

### 5.1 Alert Severity Levels

```yaml
severity_levels:
  P0_CRITICAL:
    description: "System down or data breach"
    response_time: "5 minutes"
    channels: ["pagerduty", "sms", "phone", "slack"]
    on_call: true
    examples:
      - "API error rate >50%"
      - "Database unreachable"
      - "Security breach detected"

  P1_HIGH:
    description: "Significant degradation"
    response_time: "30 minutes"
    channels: ["pagerduty", "slack"]
    on_call: true
    examples:
      - "API error rate >10%"
      - "P95 latency >5 seconds"
      - "Cloud Run out of capacity"

  P2_MEDIUM:
    description: "Minor issues, can wait"
    response_time: "4 hours"
    channels: ["slack", "email"]
    on_call: false
    examples:
      - "API error rate >5%"
      - "High LLM costs"
      - "Cache hit rate <50%"

  P3_LOW:
    description: "FYI, no action needed"
    response_time: "24 hours"
    channels: ["email"]
    on_call: false
    examples:
      - "Unusual user behavior"
      - "Low disk space warning"
```

### 5.2 Alert Rules

**Critical Alerts (P0):**
```yaml
alert: APIDown
expr: |
  sum(rate(http_requests_total{status=~"5.."}[5m])) /
  sum(rate(http_requests_total[5m])) > 0.5
for: 1m
severity: P0
channels: [pagerduty, sms, slack]
message: "API error rate >50% for 1 minute"
runbook: "https://docs.nous.com/runbooks/api-down"

---

alert: DatabaseUnreachable
expr: firestore_health == 0
for: 30s
severity: P0
channels: [pagerduty, phone, slack]
message: "Firestore is unreachable"
runbook: "https://docs.nous.com/runbooks/database-down"

---

alert: SecurityBreachDetected
expr: sum(security_incidents{severity="critical"}) > 0
for: 0s  # Immediate
severity: P0
channels: [pagerduty, sms, slack]
message: "Critical security incident detected"
runbook: "https://docs.nous.com/runbooks/security-breach"
```

**High Priority Alerts (P1):**
```yaml
alert: HighErrorRate
expr: |
  sum(rate(http_requests_total{status=~"5.."}[5m])) /
  sum(rate(http_requests_total[5m])) > 0.1
for: 5m
severity: P1
channels: [pagerduty, slack]
message: "API error rate >10% for 5 minutes"

---

alert: HighLatency
expr: histogram_quantile(0.95, http_request_duration_seconds) > 5
for: 5m
severity: P1
channels: [pagerduty, slack]
message: "P95 latency >5 seconds"

---

alert: CloudRunOutOfCapacity
expr: cloud_run_instance_count >= cloud_run_max_instances * 0.9
for: 5m
severity: P1
channels: [pagerduty, slack]
message: "Cloud Run at 90% capacity"
```

**Medium Priority Alerts (P2):**
```yaml
alert: ElevatedErrorRate
expr: |
  sum(rate(http_requests_total{status=~"5.."}[5m])) /
  sum(rate(http_requests_total[5m])) > 0.05
for: 15m
severity: P2
channels: [slack, email]
message: "API error rate >5% for 15 minutes"

---

alert: HighLLMCost
expr: sum(llm_cost_usd) OVER 1d > 1000
for: 1h
severity: P2
channels: [slack, email]
message: "LLM cost >$1000 today"

---

alert: LowCacheHitRate
expr: cache_hit_rate < 0.5
for: 30m
severity: P2
channels: [slack]
message: "Cache hit rate <50%"
```

### 5.3 Alert Implementation

```typescript
// packages/monitoring/src/alerting.ts

import { PagerDutyClient } from '@pagerduty/client';
import { WebClient as SlackClient } from '@slack/web-api';

export class AlertingService {
  private pagerduty: PagerDutyClient;
  private slack: SlackClient;

  constructor() {
    this.pagerduty = new PagerDutyClient({ token: process.env.PAGERDUTY_TOKEN });
    this.slack = new SlackClient(process.env.SLACK_TOKEN);
  }

  /**
   * Send alert to appropriate channels based on severity
   */
  async sendAlert(alert: Alert): Promise<void> {
    const { severity, title, message, context, runbook } = alert;

    switch (severity) {
      case 'P0':
        await this.sendToPagerDuty(alert);
        await this.sendToSlack('#alerts-critical', alert);
        await this.sendSMS(alert); // To on-call engineer
        break;

      case 'P1':
        await this.sendToPagerDuty(alert);
        await this.sendToSlack('#alerts-high', alert);
        break;

      case 'P2':
        await this.sendToSlack('#alerts-medium', alert);
        await this.sendEmail(alert);
        break;

      case 'P3':
        await this.sendEmail(alert);
        break;
    }

    // Log all alerts
    await this.logAlert(alert);
  }

  private async sendToPagerDuty(alert: Alert): Promise<void> {
    await this.pagerduty.incidents.create({
      incident: {
        type: 'incident',
        title: alert.title,
        service: {
          id: process.env.PAGERDUTY_SERVICE_ID!,
          type: 'service_reference'
        },
        urgency: alert.severity === 'P0' ? 'high' : 'low',
        body: {
          type: 'incident_body',
          details: `${alert.message}\n\nRunbook: ${alert.runbook}\n\nContext:\n${JSON.stringify(alert.context, null, 2)}`
        }
      }
    });
  }

  private async sendToSlack(channel: string, alert: Alert): Promise<void> {
    const color = {
      P0: 'danger',
      P1: 'warning',
      P2: '#FFA500',
      P3: '#808080'
    }[alert.severity];

    await this.slack.chat.postMessage({
      channel,
      attachments: [{
        color,
        title: `[${alert.severity}] ${alert.title}`,
        text: alert.message,
        fields: [
          {
            title: 'Runbook',
            value: alert.runbook,
            short: false
          }
        ],
        footer: 'NOUS Monitoring',
        ts: Math.floor(Date.now() / 1000).toString()
      }]
    });
  }

  private async sendSMS(alert: Alert): Promise<void> {
    // Use Twilio or similar
    const onCallNumber = await this.getOnCallNumber();
    // Send SMS...
  }
}

interface Alert {
  severity: 'P0' | 'P1' | 'P2' | 'P3';
  title: string;
  message: string;
  context?: any;
  runbook?: string;
}
```

---

## 6. SLOs & SLIs

### 6.1 Service Level Objectives

```yaml
slos:
  availability:
    target: 99.9%
    measurement_window: 30 days
    error_budget: 43 minutes per month
    sli: "successful_requests / total_requests"

    consequences:
      below_99_9: "No new features until fixed"
      below_99_5: "Emergency incident"
      below_99_0: "Escalate to CEO"

  latency:
    target: "P95 < 2 seconds"
    measurement_window: 7 days
    error_budget: "5% of requests can exceed"
    sli: "histogram_quantile(0.95, request_duration)"

    consequences:
      above_2s: "Investigate performance"
      above_3s: "Performance incident"
      above_5s: "Emergency incident"

  freshness:
    target: "Data sync < 5 minutes"
    measurement_window: 7 days
    sli: "time_since_last_sync"

    consequences:
      above_5min: "Check sync service"
      above_15min: "Sync service down"
```

### 6.2 Error Budget Tracking

```typescript
// packages/monitoring/src/error-budget.ts

export class ErrorBudgetTracker {
  /**
   * Calculate remaining error budget for the month
   */
  async calculateErrorBudget(): Promise<ErrorBudget> {
    const windowDays = 30;
    const targetUptime = 0.999; // 99.9%

    // Get total requests in window
    const totalRequests = await this.getTotalRequests(windowDays);

    // Get failed requests
    const failedRequests = await this.getFailedRequests(windowDays);

    // Calculate actual uptime
    const actualUptime = (totalRequests - failedRequests) / totalRequests;

    // Calculate budget consumed
    const allowedDowntime = 1 - targetUptime; // 0.1%
    const actualDowntime = 1 - actualUptime;
    const budgetConsumed = actualDowntime / allowedDowntime;

    // Time remaining
    const daysLeft = this.daysUntilMonthEnd();
    const budgetRemaining = 1 - budgetConsumed;

    return {
      target_uptime: targetUptime,
      actual_uptime: actualUptime,
      budget_consumed_pct: budgetConsumed * 100,
      budget_remaining_pct: budgetRemaining * 100,
      days_left_in_window: daysLeft,
      status: this.getStatus(budgetRemaining)
    };
  }

  private getStatus(budgetRemaining: number): string {
    if (budgetRemaining > 0.5) return 'healthy';
    if (budgetRemaining > 0.2) return 'warning';
    if (budgetRemaining > 0) return 'critical';
    return 'exhausted';
  }
}

interface ErrorBudget {
  target_uptime: number;
  actual_uptime: number;
  budget_consumed_pct: number;
  budget_remaining_pct: number;
  days_left_in_window: number;
  status: 'healthy' | 'warning' | 'critical' | 'exhausted';
}
```

---

## 7. Incident Response

### 7.1 Incident Severity

Same as alert severity (P0-P3).

### 7.2 Incident Response Process

```yaml
incident_response:
  detection:
    - Alert fires (automated)
    - User report (manual)
    - Monitoring anomaly

  triage:
    - Determine severity (P0-P3)
    - Assign incident commander
    - Create incident channel (#incident-2025-01-19)

  investigation:
    - Check dashboards
    - Review recent deployments
    - Analyze logs
    - Identify root cause

  mitigation:
    - Implement fix (code, config, rollback)
    - Deploy to production
    - Verify resolution
    - Monitor for recurrence

  communication:
    - Internal: Slack #incidents
    - External: Status page (status.nous.com)
    - Users: Email if impacted

  post_mortem:
    - Write incident report (within 48h)
    - Identify lessons learned
    - Create action items
    - Update runbooks
```

### 7.3 On-Call Rotation

```yaml
on_call:
  schedule:
    rotation: weekly
    handoff: Monday 9am BRT

  team:
    - Alice (Backend Lead)
    - Bob (Platform Engineer)
    - Carol (SRE)
    - Dave (Backend Engineer)

  escalation:
    level_1: On-call engineer (5 min response)
    level_2: Engineering Manager (15 min)
    level_3: CTO (30 min)
    level_4: CEO (1 hour)

  compensation:
    base: R$ 500/week
    per_incident: R$ 100
```

---

## 8. Implementation Guide

### Week 1: Metrics & Monitoring
- [ ] Setup Cloud Monitoring
- [ ] Configure key metrics
- [ ] Create system health dashboard
- [ ] Test metric collection

### Week 2: Logging
- [ ] Implement structured logging
- [ ] Setup Cloud Logging
- [ ] Add log correlation (trace IDs)
- [ ] Test log queries

### Week 3: Alerting
- [ ] Define alert rules
- [ ] Setup PagerDuty integration
- [ ] Configure Slack notifications
- [ ] Test alerting workflow

### Week 4: Dashboards & SLOs
- [ ] Build Grafana dashboards
- [ ] Define SLOs
- [ ] Implement error budget tracking
- [ ] Create runbooks

### Ongoing
- [ ] Review dashboards weekly
- [ ] Tune alert thresholds monthly
- [ ] Update runbooks as needed
- [ ] Conduct post-mortems

---

## Summary

**Comprehensive monitoring is essential for production reliability.**

Key deliverables:
- ✅ Metrics collection (system, app, business)
- ✅ Dashboards (Grafana + Cloud Console)
- ✅ Structured logging (JSON, Cloud Logging)
- ✅ Alerting (PagerDuty + Slack)
- ✅ SLOs defined (99.9% uptime, P95 <2s)
- ✅ On-call rotation established

**Target:** 99.9% uptime (43 min downtime/month allowed)

---

**Document Status:** ✅ Complete
**Next:** PERFORMANCE-SPEC.md

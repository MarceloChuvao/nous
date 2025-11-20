/**
 * CONTEXT types - Current state data
 */

import { Timestamp } from './common';

export interface HealthContext {
  bloodwork?: Record<string, any>;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  appointments?: Array<{
    date: Date;
    type: string;
    provider: string;
  }>;
}

export interface FinanceContext {
  accounts?: Array<{
    id: string;
    type: string;
    balance: number;
    currency: string;
  }>;
  transactions?: Array<{
    id: string;
    date: Date;
    amount: number;
    description: string;
    category: string;
  }>;
  budget?: Record<string, number>;
}

export interface CalendarContext {
  today?: Array<{
    time: string;
    event: string;
    location?: string;
  }>;
  week?: Array<{
    date: Date;
    events: string[];
  }>;
}

export interface Context {
  userId: string;
  health?: HealthContext;
  finance?: FinanceContext;
  calendar?: CalendarContext;
  lastUpdated: Timestamp;
}

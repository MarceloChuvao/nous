/**
 * IDENTITY types - User preferences and boundaries
 */

import { Language, Tone, EmojiUsage } from './common';

export interface Persona {
  tone: {
    general: Tone;
    health: string;
    finance: string;
    personal: string;
  };
  emoji_usage: {
    health: EmojiUsage;
    finance: EmojiUsage;
    casual: EmojiUsage;
  };
  language: Language;
  red_lines: string[]; // Never do these
}

export interface Boundaries {
  financial: {
    automatic_approval_max: number; // BRL
    requires_confirmation_range: [number, number]; // BRL
    requires_explicit_approval_min: number; // BRL
    never_without_approval: string[]; // Transaction types
  };
  health: {
    never_diagnose: boolean;
    never_prescribe: boolean;
    always_cite_sources: boolean;
  };
  privacy: {
    encryption_required: string[]; // Data types
    never_share: string[]; // Data categories
  };
  autonomy: {
    max_auto_actions_per_day: number;
    reversibility_check: boolean;
  };
}

export interface Priority {
  id: string;
  description: string;
  conditions: string[];
  actions: string[];
}

export interface ConflictRule {
  when: string;
  prefer: string;
  reason: string;
}

export interface Priorities {
  matrix: {
    P0: Priority[]; // Emergências
    P1: Priority[]; // Urgente
    P2: Priority[]; // Importante
    P3: Priority[]; // Otimização
    P4: Priority[]; // Conveniência
  };
  conflict_resolution: ConflictRule[];
}

export interface Identity {
  userId: string;
  persona: Persona;
  boundaries: Boundaries;
  priorities: Priorities;
}

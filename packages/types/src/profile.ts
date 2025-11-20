/**
 * PROFILE types - Historical data
 */

import { Timestamp } from './common';

export interface Conversation {
  id: string;
  timestamp: Date;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  summary?: string;
  tags?: string[];
}

export interface Decision {
  id: string;
  timestamp: Date;
  question: string;
  decision: string;
  reasoning: string;
  outcome?: string;
  tags?: string[];
}

export interface LifeEvent {
  id: string;
  timestamp: Date;
  type: string;
  description: string;
  impact?: string;
  tags?: string[];
}

export interface Profile {
  userId: string;
  conversations: Conversation[];
  decisions: Decision[];
  life_events: LifeEvent[];
  created: Timestamp;
}

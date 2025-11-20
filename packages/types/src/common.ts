/**
 * Common types used across NOUS OS
 */

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Timestamp {
  createdAt: Date;
  updatedAt: Date;
}

export type Language = 'pt-BR' | 'en-US';

export type Tone = 'direct' | 'friendly' | 'formal';

export type EmojiUsage = 'minimal' | 'moderate' | 'liberal';

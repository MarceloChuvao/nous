/**
 * Application constants
 */

export const APP_NAME = 'NOUS OS';
export const APP_VERSION = '1.0.0';

export const FIRESTORE_COLLECTIONS = {
  IDENTITY: 'identity',
  CONTEXT: 'context',
  PROFILE: 'profile',
  WORKING: 'working',
  LOGS: 'logs'
} as const;

export const RATE_LIMITS = {
  CHAT_PER_MINUTE: 10,
  API_PER_MINUTE: 60,
  DAILY_ACTIONS: 100
} as const;

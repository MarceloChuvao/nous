/**
 * NOUS OS - Firebase Functions Entry Point
 *
 * This file exports all Cloud Functions for the NOUS backend.
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export Cloud Functions
export { coreAgentAPI } from './core-agent';
export { healthCheck } from './health-check';

// TODO: Add more functions as we implement them
// export { authMiddleware } from './auth';
// export { vfsAPI } from './vfs';

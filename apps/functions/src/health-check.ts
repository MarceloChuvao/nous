/**
 * Health Check Function
 * Simple function to verify deployment and test the monorepo setup
 */

import * as functions from 'firebase-functions';

export const healthCheck = functions.https.onRequest((request, response) => {
  response.json({
    status: 'ok',
    message: 'NOUS OS Functions are running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * CORE Agent API
 * Main entry point for chat/query processing
 */

import * as functions from 'firebase-functions';

export const coreAgentAPI = functions.https.onRequest(async (request, response) => {
  // CORS
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'POST');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { query } = request.body;

    if (!query || typeof query !== 'string') {
      response.status(400).json({ error: 'Query is required' });
      return;
    }

    // TODO: Implement actual CORE Agent logic
    // For now, return a simple response
    response.json({
      response: `Echo: ${query}`,
      timestamp: new Date().toISOString(),
      status: 'success'
    });
  } catch (error) {
    console.error('Error in coreAgentAPI:', error);
    response.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

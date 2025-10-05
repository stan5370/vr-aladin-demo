const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', // or your domain: 'https://your-react-app.web.app'
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const { app } = require('@azure/functions');

app.http('coordsToName', {
  methods: ['GET', 'POST', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return { status: 204, headers: CORS_HEADERS };
    }

    const ra = request.query.get('RA') || '00 00 00';
    const dec = request.query.get('Declination') || '+00 00 00';
    const radius = request.query.get('radius') || 0.05;

    const queryURL = ``;
    const response = await fetch(queryURL);
    const text = await response.text();

    return {
      headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain' },
      body: text,
    };
  }
});

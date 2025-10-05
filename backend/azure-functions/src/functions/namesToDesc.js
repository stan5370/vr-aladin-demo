// functions/namesToDesc/index.js
require('dotenv').config();
const { app } = require('@azure/functions');
const { Client } = require('@elastic/elasticsearch');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', // replace with 'https://your-react-app.web.app' in prod
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

const es = new Client({
  node: process.env.ELASTIC_NODE,
  auth: { apiKey: process.env.ELASTIC_API_KEY }
});

function extractTextFromSSE(sse) {
  const lines = sse.split(/\r?\n/);
  let out = '';
  for (const line of lines) {
    if (!line.startsWith('data:')) continue;
    const jsonStr = line.slice(5).trim();
    if (!jsonStr) continue;
    try {
      const evt = JSON.parse(jsonStr);
      const delta = evt?.choices?.[0]?.delta;
      if (delta?.content) out += delta.content;
    } catch {}
  }
  return out.trim();
}

function buildMessages(starCoords) {
  return [
    {
      role: 'system',
      content:
        'You are an expert astrophysicist AI. ' +
        'Given the name of a star, return ONLY the following scientific properties without giving a range:\n' +
        '- Star Name\n' +
        '- Star Description with some facts about it in a short blurb\n' +
        '- Radius (Solar Masses)\n' +
        '- Radius Units (In Solar Masses): \n' +
        '- Absolute Magnitude\n' +
        '- Color\n' +
        '- Distance from Earth in Light Years\n\n' +
        '- Distance Units\n' +
        "- Coordinate of the Star in this format '00 00 00' for Right Ascension, '00 00 00' for Declination\n\n" +
        "- Encoded image of a high quality rendering of the star; MUST BE REAL IMAGE OR YOU ARE FIRED\n" +
        "- List out any exoplanets in a list [exoplanet_one, exoplanet_2,...]\n" +
        'Respond in a stringified json that can be parsed in JavaScript\n' +
        'Do NOT output markdown fences'
    },
    { role: 'user', content: `Star coordinates: ${starCoords}` }
  ];
}

app.http('namesToDesc', {
  methods: ['GET', 'OPTIONS'], // include OPTIONS for preflight
  authLevel: 'anonymous',
  handler: async (req, ctx) => {
    try {
      // Handle CORS preflight
      if (req.method === 'OPTIONS') {
        return { status: 204, headers: CORS_HEADERS, body: '' };
      }

      const ra = req.query.get('RA') || '00 00 00';
      const dec = req.query.get('Declination') || '+00 00 00';
      if (!ra) {
        return {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain' },
          body: 'Missing prompt'
        };
      }

      const modelId = process.env.ELASTIC_LLM_ID || '.rainbow-sprinkles-elastic';
      const messages = buildMessages(ra + " " + dec);

      // Streamed chat completion
      const stream = await es.transport.request(
        {
          method: 'POST',
          path: `/_inference/chat_completion/${encodeURIComponent(modelId)}/_stream`,
          body: { messages }
        },
        { asStream: true }
      );

      let raw = '';
      for await (const chunk of stream) raw += chunk.toString('utf8');
      const text = extractTextFromSSE(raw) || 'No response.';

      return {
        headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' },
        body: text
      };
    } catch (err) {
      ctx.log('Elastic LLM error:', err?.meta?.body || err);
      return {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' },
        body: 'LLM completion failed'
      };
    }
  }
});

// // functions/namesToDesc/index.js
// require('dotenv').config();
// const { app } = require('@azure/functions');
// const { Client } = require('@elastic/elasticsearch');

// const CORS_HEADERS = {
//   'Access-Control-Allow-Origin': '*', // replace with 'https://your-react-app.web.app' in prod
//   'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
//   'Access-Control-Allow-Headers': 'Content-Type, Authorization'
// };

// const es = new Client({
//   node: process.env.ELASTIC_NODE,
//   auth: { apiKey: process.env.ELASTIC_API_KEY }
// });

// function extractTextFromSSE(sse) {
//   const lines = sse.split(/\r?\n/);
//   let out = '';
//   for (const line of lines) {
//     if (!line.startsWith('data:')) continue;
//     const jsonStr = line.slice(5).trim();
//     if (!jsonStr) continue;
//     try {
//       const evt = JSON.parse(jsonStr);
//       const delta = evt?.choices?.[0]?.delta;
//       if (delta?.content) out += delta.content;
//     } catch {}
//   }
//   return out.trim();
// }

// // 'You are an expert astrophysicist AI. ' +
// //         'Given the name of a star, return ONLY the following scientific properties without giving a range:\n' +
// //         '- Star Name\n' +
// //         '- Star Description with some facts about it in a short blurb\n' +
// //         '- Radius (Solar Masses)\n' +
// //         '- Radius Units (In Solar Masses): \n' +
// //         '- Absolute Magnitude\n' +
// //         '- Color\n' +
// //         '- Distance from Earth in Light Years\n\n' +
// //         '- Distance Units\n' +
// //         "- Coordinate of the Star in this format '00 00 00' for Right Ascension, '00 00 00' for Declination\n\n" +
// //         "- Encoded image of a high quality rendering of the star; MUST BE REAL IMAGE OR YOU ARE FIRED\n" +
// //         "- List out any exoplanets in a list [exoplanet_one, exoplanet_2,...]\n" +
// //         'Respond in a stringified json that can be parsed in JavaScript\n' +
// //         'Do NOT output markdown fences\n' +
// //         'Put it into this format: \n' + 
// //           `namesToDesc: {
// //           "starName": "Shaula (Lambda Scorpii)",
// //           "starDescription": "Shaula, also known as Lambda Scorpii, is the second brightest star in the constellation Scorpius. It marks the stinger of the celestial scorpion. Shaula is actually a multiple star system, with its primary component being a hot, blue subgiant star. The name Shaula derives from the Arabic word meaning 'the stinger'.",
// //           "radius": 6.2,
// //           "radiusUnits": "Solar Radii",
// //           "absoluteMagnitude": -3.7,
// //           "color": "Blue-White",
// //           "distanceFromEarth": 570,
// //           "distanceUnits": "Light Years",
// //           "coordinates": {
// //             "rightAscension": "17 58 08.47",
// //             "declination": "-25 55 17.24"
// //           },
// //           "encodedImage": "https://upload.wikimedia.org/wikipedia/commons/9/90/Lambda_Scorpii_in_Scorpius.jpg",
// //           "exoplanets": []`

// function buildMessages(starCoords) {
//   return [
//     {
//       role: 'system',
//       content: 'Given the name of a star, return ONLY the following scientific properties without giving a range; use all of this in single paragraph description of the Star:\n' +
//         '- Star Name\n' +
//         '- Radius (Solar Masses)\n' +
//         '- Radius Units (In Solar Masses): \n' +
//         '- Absolute Magnitude\n' +
//         '- Color\n' +
//         '- Distance from Earth in Light Years\n\n' +
//         '- Distance Units\n' +
//         "- Coordinate of the Star in this format '00 00 00' for Right Ascension, '00 00 00' for Declination\n\n" +
//         // "- Encoded image of a high quality rendering of the star; MUST BE REAL IMAGE OR YOU ARE FIRED\n" +
//         "- List out any exoplanets in a list [exoplanet_one, exoplanet_2,...]\n"
//     },
//     { role: 'user', content: `Star coordinates: ${starCoords}` }
//   ];
// }

// app.http('namesToDesc', {
//   methods: ['GET', 'OPTIONS'], // include OPTIONS for preflight
//   authLevel: 'anonymous',
//   handler: async (req, ctx) => {
    
//     }
//   }
// });

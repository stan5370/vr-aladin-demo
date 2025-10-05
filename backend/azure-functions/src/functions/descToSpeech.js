// File: functions/descToSpeech/index.js
require('dotenv').config();
const { app } = require('@azure/functions');
const sdk = require('microsoft-cognitiveservices-speech-sdk');

app.http('descToSpeech', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      context.log(`Http function processed request for url "${request.url}"`);

      // 1. Get the input text
      let text = request.query.get('text') || '';
      if (!text) {
        try {
          const body = await request.json();
          if (body.text) text = body.text;
        } catch {}
      }
      if (!text) {
        text = (await request.text()).trim();
      }
      if (!text) {
        return { status: 400, body: 'Missing text input.' };
      }

      // 2. Configure Speech SDK
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        process.env.SPEECH_KEY,
        process.env.SPEECH_REGION
      );
      speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural'; // choose any available voice
      speechConfig.speechSynthesisOutputFormat =
        sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

      // 3. Generate speech audio (in memory)
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
      const result = await new Promise((resolve, reject) => {
        synthesizer.speakTextAsync(
          text,
          r => {
            synthesizer.close();
            resolve(r);
          },
          e => {
            synthesizer.close();
            reject(e);
          }
        );
      });

      if (result.reason !== sdk.ResultReason.SynthesizingAudioCompleted) {
        context.log('Speech synthesis failed:', result);
        return { status: 500, body: 'Speech synthesis failed.' };
      }

      // 4. Return audio file to client
      const audioBuffer = Buffer.from(result.audioData);
      return {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Disposition': 'inline; filename="speech.mp3"',
          'Access-Control-Allow-Origin': '*',
        },
        body: audioBuffer,
      };
    } catch (err) {
      context.log('Speech synthesis error:', err);
      return { status: 500, body: 'Azure Speech synthesis error.' };
    }
  },
});

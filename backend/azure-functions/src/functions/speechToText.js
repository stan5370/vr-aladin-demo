// functions/speechToText/index.js
require('dotenv').config();
const { app } = require('@azure/functions');
const sdk = require('microsoft-cognitiveservices-speech-sdk');

app.http('speechToText', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (req, ctx) => {
    try {
      // 0) Env
      const key = process.env.SPEECH_KEY;
      const region = (process.env.SPEECH_REGION || '').toLowerCase();
      if (!key || !region) return { status: 500, body: 'Missing SPEECH_KEY or SPEECH_REGION (e.g., eastus).' };

      // 1) Require WAV body
      const ct = (req.headers.get('content-type') || '').toLowerCase();
      if (!ct.includes('audio/wav') && !ct.includes('audio/x-wav')) {
        return { status: 415, body: 'Send raw WAV audio with Content-Type: audio/wav.' };
      }

      const arrayBuffer = await req.arrayBuffer();
      const wavBuffer = Buffer.from(arrayBuffer || new ArrayBuffer(0));
      if (!wavBuffer.length) return { status: 400, body: 'No audio data received.' };

      // 2) Quick WAV sanity check: RIFF...WAVE
      const isRiff = wavBuffer.slice(0, 4).toString('ascii') === 'RIFF';
      const isWave = wavBuffer.slice(8, 12).toString('ascii') === 'WAVE';
      if (!isRiff || !isWave) {
        return { status: 415, body: 'Invalid WAV header. Provide RIFF/WAVE PCM WAV (e.g., 16kHz mono PCM).' };
      }

      // 3) Speech config (increase silence windows)
      const lang = (req.query.get('lang') || 'en-US').trim();
      const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
      speechConfig.speechRecognitionLanguage = lang;
      speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, '20000'); // 20s
      speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, '5000');      // 5s

      // 4) Feed WAV
      const push = sdk.AudioInputStream.createPushStream();
      push.write(wavBuffer);
      push.close();
      const audioConfig = sdk.AudioConfig.fromStreamInput(push);

      // 5) Continuous recognition (more tolerant than recognizeOnce)
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

      const transcript = await new Promise((resolve, reject) => {
        let collected = '';

        recognizer.recognized = (_s, e) => {
          if (e.result?.text) collected += (collected ? ' ' : '') + e.result.text;
        };
        recognizer.canceled = (_s, e) => {
          if (collected) resolve(collected);
          else reject(new Error(e.errorDetails || 'Canceled'));
        };
        recognizer.sessionStopped = () => {
          recognizer.stopContinuousRecognitionAsync(
            () => resolve(collected || ''),
            (err) => reject(err)
          );
        };

        recognizer.startContinuousRecognitionAsync(
          () => {
            // Safety: stop after 25s total processing
            setTimeout(() => recognizer.stopContinuousRecognitionAsync(() => {}, reject), 25000);
          },
          reject
        );
      });

      if (transcript) {
        return { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: transcript, language: lang }) };
      }
      return { status: 400, body: 'No speech recognized (silence or unsupported audio).' };

    } catch (err) {
      // If the service returned JSON diagnostics, include them
      try {
        const details = err?.message || err?.toString?.();
        return { status: 500, body: `Speech-to-text conversion error: ${details}` };
      } catch {
        return { status: 500, body: 'Speech-to-text conversion error.' };
      }
    }
  }
});

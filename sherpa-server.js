/**
 * A standalone Express.js server for SherpaOnnx TTS
 * This server runs separately from Next.js and handles all SherpaOnnx-related functionality
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// The environment variables are set by the run-sherpa-server.sh script
// We don't need to set them here

// Create Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Check if we should use the mock implementation
// Allow forcing real implementation even on Digital Ocean with environment variable
const useMock = process.env.USE_SHERPAONNX_MOCK === 'true';
const forceReal = process.env.FORCE_SHERPAONNX_REAL === 'true';

// The actual import and initialization will be handled in the initializeSherpaOnnxClient function

// Define the mock implementation
// This will be used as a fallback if the real implementation fails to load
class MockSherpaOnnxTTSClient {
    constructor(config) {
      this.config = config || {};
      console.log('Created MockSherpaOnnxTTSClient with config:', this.config);
    }

    async checkCredentials() {
      console.log('Mock checkCredentials called');
      return true;
    }

    async getVoices() {
      console.log('Mock getVoices called');
      return [
        {
          id: 'piper-en-alan-low',
          name: 'Alan (Low)',
          languageCodes: [{ code: 'en-GB', display: 'English (GB)' }],
          gender: 'MALE',
          engine: 'sherpaonnx'
        },
        {
          id: 'piper-en-amy-low',
          name: 'Amy (Low)',
          languageCodes: [{ code: 'en-GB', display: 'English (GB)' }],
          gender: 'FEMALE',
          engine: 'sherpaonnx'
        }
      ];
    }

    async synthesizeSpeech(text, voiceId, _options = {}) {
      console.log(`Mock synthesizeSpeech called with text: "${text}", voiceId: ${voiceId}`);
      // Generate a simple sine wave as mock audio
      const sampleRate = 16000;
      const duration = 2; // seconds
      const frequency = 440; // Hz (A4 note)
      const numSamples = sampleRate * duration;
      const audio = Buffer.alloc(numSamples * 2); // 16-bit samples

      for (let i = 0; i < numSamples; i++) {
        const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0x7FFF;
        audio.writeInt16LE(sample, i * 2);
      }

      // Create a WAV header
      const header = Buffer.alloc(44);
      // RIFF chunk descriptor
      header.write('RIFF', 0);
      header.writeUInt32LE(36 + audio.length, 4); // file size
      header.write('WAVE', 8);
      // fmt sub-chunk
      header.write('fmt ', 12);
      header.writeUInt32LE(16, 16); // fmt chunk size
      header.writeUInt16LE(1, 20); // audio format (PCM)
      header.writeUInt16LE(1, 22); // num channels
      header.writeUInt32LE(sampleRate, 24); // sample rate
      header.writeUInt32LE(sampleRate * 2, 28); // byte rate
      header.writeUInt16LE(2, 32); // block align
      header.writeUInt16LE(16, 34); // bits per sample
      // data sub-chunk
      header.write('data', 36);
      header.writeUInt32LE(audio.length, 40); // data chunk size

      // Combine header and audio data
      return Buffer.concat([header, audio]);
    }
  }

// Global variable to hold the initialized client
let sherpaOnnxClient = null;

// Async function to initialize SherpaOnnx client
async function initializeSherpaOnnxClient() {
  if (useMock && !forceReal) {
    console.log('Using mock implementation for SherpaOnnx (as specified by environment variable)');
    sherpaOnnxClient = new MockSherpaOnnxTTSClient({});
    return;
  }

  try {
    // Try to dynamically import the SherpaOnnxTTSClient
    let ImportedSherpaOnnxTTSClient;
    try {
      // First try CommonJS require
      const wrapper = require('js-tts-wrapper');
      ImportedSherpaOnnxTTSClient = wrapper.SherpaOnnxTTSClient;
      console.log('Successfully imported SherpaOnnxTTSClient via CommonJS require');
    } catch (requireError) {
      console.log('CommonJS require failed, trying dynamic import...');
      // If require fails, try dynamic import for ES modules
      const wrapper = await import('js-tts-wrapper');
      ImportedSherpaOnnxTTSClient = wrapper.SherpaOnnxTTSClient;
      console.log('Successfully imported SherpaOnnxTTSClient via dynamic import');
    }

    if (ImportedSherpaOnnxTTSClient) {
      sherpaOnnxClient = new ImportedSherpaOnnxTTSClient({});
      console.log('Successfully created real SherpaOnnxTTSClient instance');
    } else {
      throw new Error('SherpaOnnxTTSClient not found in js-tts-wrapper');
    }
  } catch (error) {
    console.error('Failed to import SherpaOnnxTTSClient from js-tts-wrapper:', error.message);
    console.log('Using mock implementation for SherpaOnnx due to import failure');
    sherpaOnnxClient = new MockSherpaOnnxTTSClient({});
  }
}

// Define routes
app.get('/voices', async (_req, res) => {
  console.log('GET /voices');

  // Ensure client is initialized
  if (!sherpaOnnxClient) {
    console.error('SherpaOnnx client not initialized');
    return res.status(500).json({ error: 'SherpaOnnx client not initialized' });
  }

  try {
    // Use the SherpaOnnxTTSClient to get the voices
    const voices = await sherpaOnnxClient.getVoices();
    console.log(`Found ${voices.length} voices`);

    // Debug the first voice to check its format
    if (voices.length > 0) {
      console.log('First voice format:', JSON.stringify(voices[0]));
    }

    // Make sure all voices have the engine property set to 'sherpaonnx'
    const voicesWithEngine = voices.map(voice => {
      // Create a completely new object with only the properties we need
      return {
        id: voice.id,
        name: voice.name,
        languageCodes: voice.languageCodes,
        gender: voice.gender || 'NEUTRAL',
        engine: 'sherpaonnx'
      };
    });

    // Log a sample voice after transformation
    if (voicesWithEngine.length > 0) {
      console.log('Sample transformed voice:', JSON.stringify(voicesWithEngine[0]));
    }

    return res.json(voicesWithEngine);
  } catch (error) {
    console.error('Error getting SherpaOnnx voices:', error);
    return res.status(500).json({ error: `Error getting voices: ${error.message}` });
  }
});

app.post('/tts', async (req, res) => {
  console.log('POST /tts');

  // Ensure client is initialized
  if (!sherpaOnnxClient) {
    console.error('SherpaOnnx client not initialized');
    return res.status(500).json({ error: 'SherpaOnnx client not initialized' });
  }

  const { text, voiceId, options = {} } = req.body;

  if (!text) {
    console.error('Missing text parameter');
    return res.status(400).json({ error: 'Text is required' });
  }

  if (!voiceId) {
    console.error('Missing voiceId parameter');
    return res.status(400).json({ error: 'Voice ID is required' });
  }

  try {
    console.log(`Synthesizing speech with SherpaOnnx: "${text}" using voice ${voiceId}`);

    // Use the SherpaOnnxTTSClient to synthesize speech
    const audioBuffer = await sherpaOnnxClient.synthesizeSpeech(text, voiceId, options);

    console.log(`Generated audio of length ${audioBuffer.length}`);

    // Set the response headers
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', audioBuffer.length);

    // Send the audio
    return res.send(audioBuffer);
  } catch (error) {
    console.error('Error synthesizing speech with SherpaOnnx:', error);
    return res.status(500).json({ error: `Error synthesizing speech: ${error.message}` });
  }
});

// Start the server
const PORT = process.env.SHERPAONNX_PORT || 3002;

// Initialize the SherpaOnnx client and start the server
async function startServer() {
  console.log('Initializing SherpaOnnx client...');
  await initializeSherpaOnnxClient();

  app.listen(PORT, () => {
    console.log(`SherpaOnnx server listening on port ${PORT}`);
  });
}

// Start the server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

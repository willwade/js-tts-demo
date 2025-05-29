/**
 * Simplified SherpaOnnx server using js-tts-wrapper v0.1.23 with lexicon file fixes
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Create Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Global variables
let SherpaOnnxTTSClient;
let sherpaOnnxClient = null;

// Initialize server with js-tts-wrapper v0.1.23
async function initializeServer() {
  console.log('Initializing SherpaOnnx server with js-tts-wrapper v0.1.23...');

  try {
    // This should now work with the CommonJS fix and lexicon file downloads in v0.1.23
    const wrapper = require('js-tts-wrapper');
    SherpaOnnxTTSClient = wrapper.SherpaOnnxTTSClient;
    console.log('✅ Successfully imported SherpaOnnxTTSClient');

    // Check diagnostics if available
    if (typeof SherpaOnnxTTSClient.getDiagnostics === 'function') {
      const diagnostics = SherpaOnnxTTSClient.getDiagnostics();
      console.log('📊 SherpaOnnx Diagnostics:', diagnostics);
    }

    // Create client with fallback enabled
    sherpaOnnxClient = new SherpaOnnxTTSClient({
      allowMockFallback: true,
      forceNative: process.env.FORCE_SHERPAONNX_REAL === 'true'
    });

    console.log('✅ SherpaOnnx client created successfully');

  } catch (error) {
    console.error('❌ Failed to initialize SherpaOnnx:', error.message);
    throw error;
  }
}

// Routes
app.get('/voices', async (_req, res) => {
  console.log('GET /voices');

  if (!sherpaOnnxClient) {
    return res.status(500).json({ error: 'SherpaOnnx client not initialized' });
  }

  try {
    const voices = await sherpaOnnxClient.getVoices();
    console.log(`Found ${voices.length} voices`);

    // Ensure all voices have the engine property
    const voicesWithEngine = voices.map(voice => ({
      id: voice.id,
      name: voice.name,
      languageCodes: voice.languageCodes,
      gender: voice.gender || 'NEUTRAL',
      engine: 'sherpaonnx'
    }));

    return res.json(voicesWithEngine);
  } catch (error) {
    console.error('Error getting voices:', error);
    return res.status(500).json({ error: `Error getting voices: ${error.message}` });
  }
});

app.post('/tts', async (req, res) => {
  console.log('POST /tts');

  if (!sherpaOnnxClient) {
    return res.status(500).json({ error: 'SherpaOnnx client not initialized' });
  }

  const { text, voiceId, options = {} } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  if (!voiceId) {
    return res.status(400).json({ error: 'Voice ID is required' });
  }

  try {
    console.log(`Synthesizing speech: "${text}" using voice ${voiceId}`);

    // Set the voice first
    sherpaOnnxClient.setVoice(voiceId);

    // Apply any additional options
    if (options) {
      if (options.rate) sherpaOnnxClient.setProperty("rate", options.rate);
      if (options.pitch) sherpaOnnxClient.setProperty("pitch", options.pitch);
      if (options.volume) sherpaOnnxClient.setProperty("volume", options.volume);
    }

    // Synthesize the speech using the correct API method
    const audioBuffer = await sherpaOnnxClient.synthToBytes(text, { format: 'wav' });

    console.log(`Generated audio of length ${audioBuffer.length}`);

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', audioBuffer.length);

    return res.send(audioBuffer);
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    return res.status(500).json({ error: `Error synthesizing speech: ${error.message}` });
  }
});

// Start server
const PORT = process.env.SHERPAONNX_PORT || 3002;

initializeServer().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 SherpaOnnx server listening on port ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

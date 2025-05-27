/**
 * SherpaOnnx WebAssembly TTS Server
 *
 * This server provides endpoints for generating and serving SherpaOnnx WebAssembly TTS modules.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import the SherpaOnnxWasmTTSClient from js-tts-wrapper
// Note: SherpaOnnxWasmTTSClient is designed for browser environments
// For the server, we'll create a simple mock implementation
let SherpaOnnxWasmTTSClient;

try {
  // Try to import, but expect it might fail in Node.js environment
  const wrapper = require('js-tts-wrapper');
  SherpaOnnxWasmTTSClient = wrapper.SherpaOnnxWasmTTSClient;
} catch (error) {
  console.log('Note: SherpaOnnxWasmTTSClient not available in Node.js environment (this is expected)');
  console.log('Using mock implementation for WASM server');

  // Create a mock implementation for the server
  SherpaOnnxWasmTTSClient = class MockSherpaOnnxWasmTTSClient {
    constructor(config) {
      this.config = config || {};
    }

    async getVoices() {
      return [];
    }
  };
}

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Serve static WebAssembly files
app.use('/wasm', express.static(path.join(__dirname, 'public/wasm')));

// Create the public/wasm directory if it doesn't exist
const wasmDir = path.join(__dirname, 'public/wasm');
if (!fs.existsSync(wasmDir)) {
  fs.mkdirSync(wasmDir, { recursive: true });
  console.log(`Created directory: ${wasmDir}`);
}

// Endpoint to get available voices
app.get('/voices', async (req, res) => {
  try {
    // Get available WebAssembly modules
    const files = fs.readdirSync(wasmDir);
    const jsFiles = files.filter(file => file.endsWith('.js'));

    // Extract voice IDs from filenames
    const voices = jsFiles.map(file => {
      const voiceId = file.replace('.js', '');
      return {
        id: voiceId,
        name: voiceId.replace(/_/g, ' '),
        languageCodes: [{ code: 'en-US', display: 'English (US)' }],
        gender: 'FEMALE',
        engine: 'sherpaonnx-wasm'
      };
    });

    console.log(`Found ${voices.length} voices`);

    return res.json(voices);
  } catch (error) {
    console.error('Error getting voices:', error);
    return res.status(500).json({ error: `Error getting voices: ${error.message}` });
  }
});

// Endpoint to get WebAssembly module for a specific voice
app.post('/generate', async (req, res) => {
  try {
    const { voiceId } = req.body;

    if (!voiceId) {
      return res.status(400).json({ error: 'Voice ID is required' });
    }

    console.log(`Getting WebAssembly module for voice: ${voiceId}`);

    // Check if the WebAssembly module exists
    const wasmPath = path.join(wasmDir, `${voiceId}.wasm`);
    const jsPath = path.join(wasmDir, `${voiceId}.js`);

    if (!fs.existsSync(wasmPath) || !fs.existsSync(jsPath)) {
      return res.status(404).json({ error: `WebAssembly module for voice ${voiceId} not found` });
    }

    console.log(`WebAssembly module found for voice: ${voiceId}`);

    return res.json({
      success: true,
      wasmUrl: `/wasm/${voiceId}.wasm`,
      jsUrl: `/wasm/${voiceId}.js`
    });
  } catch (error) {
    console.error('Error getting WebAssembly module:', error);
    return res.status(500).json({ error: `Error getting WebAssembly module: ${error.message}` });
  }
});

// Start the server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`SherpaOnnx WebAssembly TTS server listening on port ${PORT}`);
});

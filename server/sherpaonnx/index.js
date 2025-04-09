/**
 * Server-side only module for SherpaOnnx TTS
 * This file should never be imported from client-side code
 */

// We use require instead of import to ensure this is only loaded on the server
let sherpaOnnx = null;
try {
  // Dynamically load the sherpa-onnx-node module
  sherpaOnnx = require('sherpa-onnx-node');
  console.log('Successfully loaded sherpa-onnx-node');
} catch (error) {
  console.error('Failed to load sherpa-onnx-node:', error.message);
  // We'll handle this error in the functions below
}

/**
 * Get voices from SherpaOnnx
 * @returns {Promise<Array>} Array of voice objects
 */
async function getVoices() {
  if (!sherpaOnnx) {
    console.error('SherpaOnnx is not initialized');
    return [];
  }

  try {
    // Create a minimal config for SherpaOnnx
    const config = {
      modelDir: process.env.SHERPAONNX_MODEL_DIR || '/Users/willwade/.js-tts-wrapper/models',
    };

    // Get the list of available models
    const models = [
      { id: 'mms_eng', name: 'MMS English', language: 'en-US' },
      { id: 'piper-en-alan-low', name: 'Piper Alan (Low)', language: 'en-GB' },
    ];

    // Transform the models to match the expected format
    return models.map((model) => ({
      id: model.id,
      name: model.name,
      language: model.language,
      languageDisplay: model.language === 'en-US' ? 'English (US)' : 'English (GB)',
      gender: 'NEUTRAL',
      engine: 'sherpaonnx',
    }));
  } catch (error) {
    console.error('Error getting SherpaOnnx voices:', error);
    return [];
  }
}

/**
 * Synthesize speech using SherpaOnnx
 * @param {string} text - Text to synthesize
 * @param {string} voiceId - Voice ID to use
 * @param {Object} options - Additional options
 * @returns {Promise<Buffer>} Audio buffer
 */
async function synthesizeSpeech(text, voiceId, options = {}) {
  if (!sherpaOnnx) {
    console.error('SherpaOnnx is not initialized');
    throw new Error('SherpaOnnx is not initialized');
  }

  try {
    console.log(`Synthesizing speech with SherpaOnnx: "${text}" using voice ${voiceId}`);
    
    // Get the path to the model files
    const modelDir = process.env.SHERPAONNX_MODEL_DIR || '/Users/willwade/.js-tts-wrapper/models';
    const voiceDir = `${modelDir}/${voiceId}`;
    
    console.log(`Using voice directory: ${voiceDir}`);
    
    // Create a config for the TTS engine
    const config = {
      model: `${voiceDir}/model.onnx`,
      tokens: `${voiceDir}/tokens.txt`,
      dataDir: voiceDir,
    };
    
    // Create the TTS engine
    const OfflineTts = sherpaOnnx.OfflineTts;
    const tts = new OfflineTts(config);
    
    // Generate the audio
    const audio = tts.generateWav(text);
    
    console.log(`Generated audio of length ${audio.length}`);
    
    return Buffer.from(audio);
  } catch (error) {
    console.error('Error synthesizing speech with SherpaOnnx:', error);
    throw error;
  }
}

/**
 * Check if SherpaOnnx credentials are valid
 * @returns {Promise<boolean>} True if credentials are valid
 */
async function checkCredentials() {
  return sherpaOnnx !== null;
}

module.exports = {
  getVoices,
  synthesizeSpeech,
  checkCredentials,
};

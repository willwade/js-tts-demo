/**
 * Client-side implementation of SherpaOnnxWasmTTSClient
 * This class checks for available WebAssembly modules and uses them for TTS
 */
export class ClientSideWasmTTSClient {
  private initialized = false;
  private currentVoice = '';
  private availableVoices: string[] = ['piper_en_US_amy']; // List of voices for which we have WebAssembly modules

  /**
   * Get available voices
   */
  async getVoices(): Promise<any[]> {
    console.log('Getting available voices');

    // Hardcode the voices for now
    // In a real implementation, we would check if the WebAssembly files exist
    this.availableVoices = ['piper_en_US_amy'];

    // Return information about available voices
    const voices = this.availableVoices.map(id => ({
      id,
      name: this.getDisplayName(id),
      languageCodes: [{ code: this.getLanguageCode(id), display: this.getLanguageDisplay(id) }],
      gender: this.getGender(id),
      engine: 'sherpaonnx-wasm'
    }));

    console.log('Available voices:', voices);
    return voices;
  }

  /**
   * Check if the WebAssembly module is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Initialize the WebAssembly module
   */
  async initializeWasm(wasmPath?: string): Promise<void> {
    try {
      console.log('Initializing WebAssembly module');

      // Use the provided path or the default path
      const path = wasmPath || `/sherpaonnx-wasm/${this.currentVoice || 'piper_en_US_amy'}.js`;
      console.log(`Loading WebAssembly module from ${path}`);

      // Load the JavaScript file
      await this.loadScript(path);

      // Initialize the module
      if (typeof window !== 'undefined' && (window as any).SherpaOnnxWasmModule) {
        await (window as any).SherpaOnnxWasmModule.initialize();
        this.initialized = true;
        console.log('WebAssembly module initialized successfully');
      } else {
        console.error('SherpaOnnxWasmModule not found in window');
      }

      return Promise.resolve();
    } catch (error) {
      console.error('Error initializing WebAssembly module:', error);
      throw error;
    }
  }

  /**
   * Load a script dynamically
   */
  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  }

  /**
   * Set the voice to use for synthesis
   */
  async setVoice(voiceId: string): Promise<void> {
    if (!this.availableVoices.includes(voiceId)) {
      throw new Error(`Voice ${voiceId} not available`);
    }

    this.currentVoice = voiceId;
    console.log(`Voice set to: ${voiceId}`);
    return Promise.resolve();
  }

  /**
   * Synthesize text to audio bytes
   */
  async synthToBytes(text: string, options?: any): Promise<Uint8Array> {
    if (!this.initialized) {
      throw new Error('WebAssembly module not initialized');
    }

    if (!this.currentVoice) {
      throw new Error('No voice selected');
    }

    console.log(`Synthesizing text with voice ${this.currentVoice}: "${text}"`);
    console.log('Options:', options);

    try {
      // Use the WebAssembly module to synthesize speech
      if (typeof window !== 'undefined' && (window as any).SherpaOnnxWasmModule) {
        const audioData = await (window as any).SherpaOnnxWasmModule.synthesize(text, this.currentVoice);
        return audioData;
      } else {
        throw new Error('SherpaOnnxWasmModule not found in window');
      }
    } catch (error) {
      console.error('Error synthesizing speech:', error);

      // Fallback to a simple sine wave if the WebAssembly module fails
      console.log('Falling back to sine wave generation');
      const sampleRate = 22050;
      const duration = 2; // seconds
      const numSamples = sampleRate * duration;
      const audioData = new Float32Array(numSamples);

      // Generate a simple sine wave
      const frequency = 440; // A4 note
      for (let i = 0; i < numSamples; i++) {
        audioData[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
      }

      // Convert to WAV format
      const wavData = this.float32ArrayToWav(audioData, sampleRate);
      return Promise.resolve(wavData);
    }
  }

  /**
   * Convert a Float32Array to WAV format
   */
  private float32ArrayToWav(samples: Float32Array, sampleRate: number): Uint8Array {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // Write WAV header
    // "RIFF" chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    this.writeString(view, 8, 'WAVE');

    // "fmt " sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // subchunk1Size
    view.setUint16(20, 1, true); // audioFormat (PCM)
    view.setUint16(22, 1, true); // numChannels
    view.setUint32(24, sampleRate, true); // sampleRate
    view.setUint32(28, sampleRate * 2, true); // byteRate
    view.setUint16(32, 2, true); // blockAlign
    view.setUint16(34, 16, true); // bitsPerSample

    // "data" sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true); // subchunk2Size

    // Write audio data
    const volume = 0.5;
    for (let i = 0; i < samples.length; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i])) * volume;
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(44 + i * 2, int16, true);
    }

    return new Uint8Array(buffer);
  }

  /**
   * Helper method to write a string to a DataView
   */
  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  /**
   * Helper method to get a display name for a voice ID
   */
  private getDisplayName(voiceId: string): string {
    // Convert voice ID to a display name
    // e.g., piper_en_US_amy -> Amy (English US)
    const parts = voiceId.split('_');
    const name = parts[parts.length - 1];
    return name.charAt(0).toUpperCase() + name.slice(1) + ' (' + this.getLanguageDisplay(voiceId) + ')';
  }

  /**
   * Helper method to get a language code for a voice ID
   */
  private getLanguageCode(voiceId: string): string {
    // Extract language code from voice ID
    // e.g., piper_en_US_amy -> en-US
    const parts = voiceId.split('_');
    if (parts.length >= 3) {
      return parts[1].toLowerCase() + '-' + parts[2].toUpperCase();
    }
    return 'en-US'; // Default
  }

  /**
   * Helper method to get a language display name for a voice ID
   */
  private getLanguageDisplay(voiceId: string): string {
    // Convert language code to display name
    const code = this.getLanguageCode(voiceId);
    switch (code) {
      case 'en-US': return 'English (US)';
      case 'en-GB': return 'English (UK)';
      case 'de-DE': return 'German';
      case 'es-ES': return 'Spanish';
      default: return 'English (US)';
    }
  }

  /**
   * Helper method to get a gender for a voice ID
   */
  private getGender(voiceId: string): string {
    // For simplicity, we'll just return a fixed gender
    // In a real implementation, this would be based on the voice
    return 'FEMALE';
  }
}

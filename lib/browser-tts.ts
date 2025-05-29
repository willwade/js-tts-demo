"use client"

import { TTSEngine, Voice, TTSCredentials } from "./tts-client"
import { getEngineConfig, getBrowserEngines } from "./tts-config"

// Browser-side TTS client interface
export interface BrowserTTSClient {
  checkCredentials(): Promise<boolean>
  getVoices(): Promise<Voice[]>
  setVoice(voiceId: string): void
  setProperty(property: string, value: any): void
  synthToBytes(text: string, options?: any): Promise<Uint8Array>
}

// Browser TTS Manager class
export class BrowserTTSManager {
  private clients: Map<TTSEngine, BrowserTTSClient> = new Map()
  private initialized: Set<TTSEngine> = new Set()

  constructor() {
    // Initialize in browser environment only
    if (typeof window !== 'undefined') {
      this.initializeBrowserEngines()
    }
  }

  private async initializeBrowserEngines() {
    const browserEngines = getBrowserEngines()

    for (const engine of browserEngines) {
      try {
        await this.initializeEngine(engine)
      } catch (error) {
        console.warn(`Failed to initialize browser engine ${engine}:`, error)
      }
    }
  }

  private async initializeEngine(engine: TTSEngine): Promise<void> {
    if (this.initialized.has(engine)) {
      return
    }

    try {
      let client: BrowserTTSClient | null = null

      // Dynamically import and initialize browser engines
      switch (engine) {
        case 'espeak-wasm':
          client = await this.initializeEspeakWasm()
          break
        case 'sherpaonnx-wasm':
          client = await this.initializeSherpaOnnxWasm()
          break
        case 'mock':
          client = this.initializeMockClient()
          break
        default:
          console.warn(`Browser engine ${engine} not supported`)
          return
      }

      if (client) {
        this.clients.set(engine, client)
        this.initialized.add(engine)
        console.log(`Browser engine ${engine} initialized successfully`)
      }
    } catch (error) {
      console.error(`Failed to initialize browser engine ${engine}:`, error)
      throw error
    }
  }

  private async initializeEspeakWasm(): Promise<BrowserTTSClient> {
    try {
      // Create a specialized mock client for eSpeak WASM
      console.log('EspeakWasm engine initialized (mock implementation)')
      return {
        async checkCredentials() {
          return true
        },
        async getVoices() {
          return [
            {
              id: 'espeak-en-us',
              name: 'eSpeak English (US)',
              engine: 'espeak-wasm',
              languageCodes: [{ code: 'en-US', display: 'English (US)' }],
              gender: 'NEUTRAL'
            },
            {
              id: 'espeak-en-gb',
              name: 'eSpeak English (UK)',
              engine: 'espeak-wasm',
              languageCodes: [{ code: 'en-GB', display: 'English (UK)' }],
              gender: 'NEUTRAL'
            },
            {
              id: 'espeak-es',
              name: 'eSpeak Spanish',
              engine: 'espeak-wasm',
              languageCodes: [{ code: 'es-ES', display: 'Spanish (Spain)' }],
              gender: 'NEUTRAL'
            }
          ]
        },
        setVoice(voiceId: string) {
          console.log(`eSpeak WASM: Set voice to ${voiceId}`)
        },
        setProperty(property: string, value: any) {
          console.log(`eSpeak WASM: Set ${property} to ${value}`)
        },
        async synthToBytes(text: string, options?: any) {
          // Generate a simple sine wave as mock audio
          const sampleRate = 22050
          const duration = Math.min(text.length * 0.08, 5)
          const numSamples = sampleRate * duration
          const audioData = new Float32Array(numSamples)

          // Generate a more speech-like waveform
          const frequency = 200 // Lower frequency for speech-like sound
          for (let i = 0; i < numSamples; i++) {
            audioData[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.2 *
                          Math.sin(2 * Math.PI * (frequency * 2.5) * i / sampleRate) * 0.1
          }

          return new Uint8Array(audioData.buffer)
        }
      }
    } catch (error) {
      console.error('Failed to load EspeakBrowserTTSClient:', error)
      throw new Error('EspeakBrowserTTSClient not available')
    }
  }

  private async initializeSherpaOnnxWasm(): Promise<BrowserTTSClient> {
    try {
      // Create a specialized mock client for SherpaOnnx WASM
      console.log('SherpaOnnxWasm engine initialized (mock implementation)')
      return {
        async checkCredentials() {
          return true
        },
        async getVoices() {
          return [
            {
              id: 'sherpa-jenny',
              name: 'SherpaOnnx Jenny (Neural)',
              engine: 'sherpaonnx-wasm',
              languageCodes: [{ code: 'en-US', display: 'English (US)' }],
              gender: 'FEMALE'
            },
            {
              id: 'sherpa-ryan',
              name: 'SherpaOnnx Ryan (Neural)',
              engine: 'sherpaonnx-wasm',
              languageCodes: [{ code: 'en-US', display: 'English (US)' }],
              gender: 'MALE'
            },
            {
              id: 'sherpa-multilingual',
              name: 'SherpaOnnx Multilingual',
              engine: 'sherpaonnx-wasm',
              languageCodes: [
                { code: 'en-US', display: 'English (US)' },
                { code: 'es-ES', display: 'Spanish (Spain)' },
                { code: 'fr-FR', display: 'French (France)' }
              ],
              gender: 'NEUTRAL'
            }
          ]
        },
        setVoice(voiceId: string) {
          console.log(`SherpaOnnx WASM: Set voice to ${voiceId}`)
        },
        setProperty(property: string, value: any) {
          console.log(`SherpaOnnx WASM: Set ${property} to ${value}`)
        },
        async synthToBytes(text: string, options?: any) {
          // Generate a higher quality mock audio for neural TTS
          const sampleRate = 22050
          const duration = Math.min(text.length * 0.1, 6)
          const numSamples = sampleRate * duration
          const audioData = new Float32Array(numSamples)

          // Generate a more complex waveform to simulate neural TTS
          for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate
            const fundamental = 150 + Math.sin(t * 2) * 20 // Varying fundamental frequency
            const harmonic1 = Math.sin(2 * Math.PI * fundamental * t) * 0.4
            const harmonic2 = Math.sin(2 * Math.PI * fundamental * 2 * t) * 0.2
            const harmonic3 = Math.sin(2 * Math.PI * fundamental * 3 * t) * 0.1

            audioData[i] = (harmonic1 + harmonic2 + harmonic3) * 0.3
          }

          return new Uint8Array(audioData.buffer)
        }
      }
    } catch (error) {
      console.error('Failed to load SherpaOnnxWasmTTSClient:', error)
      throw new Error('SherpaOnnxWasmTTSClient not available')
    }
  }

  private initializeMockClient(): BrowserTTSClient {
    return {
      async checkCredentials() {
        return true
      },
      async getVoices() {
        return [
          {
            id: 'mock-browser-voice-1',
            name: 'Mock Browser Voice 1',
            engine: 'mock',
            languageCodes: [{ code: 'en-US', display: 'English (US)' }],
            gender: 'FEMALE'
          },
          {
            id: 'mock-browser-voice-2',
            name: 'Mock Browser Voice 2',
            engine: 'mock',
            languageCodes: [{ code: 'en-GB', display: 'English (UK)' }],
            gender: 'MALE'
          }
        ]
      },
      setVoice(voiceId: string) {
        console.log(`Mock: Set voice to ${voiceId}`)
      },
      setProperty(property: string, value: any) {
        console.log(`Mock: Set ${property} to ${value}`)
      },
      async synthToBytes(text: string, options?: any) {
        // Generate a simple sine wave as mock audio
        const sampleRate = 22050
        const duration = Math.min(text.length * 0.1, 5) // Dynamic duration based on text length
        const numSamples = sampleRate * duration
        const audioData = new Float32Array(numSamples)

        // Generate a simple sine wave
        const frequency = 440 // A4 note
        for (let i = 0; i < numSamples; i++) {
          audioData[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3
        }

        return new Uint8Array(audioData.buffer)
      }
    }
  }

  // Public methods
  async getClient(engine: TTSEngine): Promise<BrowserTTSClient | null> {
    if (!this.isEngineSupported(engine)) {
      return null
    }

    if (!this.initialized.has(engine)) {
      await this.initializeEngine(engine)
    }

    return this.clients.get(engine) || null
  }

  isEngineSupported(engine: TTSEngine): boolean {
    const browserEngines = getBrowserEngines()
    return browserEngines.includes(engine)
  }

  async isEngineAvailable(engine: TTSEngine): Promise<boolean> {
    try {
      const client = await this.getClient(engine)
      return client !== null
    } catch {
      return false
    }
  }

  async getAvailableEngines(): Promise<TTSEngine[]> {
    const browserEngines = getBrowserEngines()
    const available: TTSEngine[] = []

    for (const engine of browserEngines) {
      const isAvailable = await this.isEngineAvailable(engine)
      if (isAvailable) {
        available.push(engine)
      }
    }

    return available
  }

  async getVoices(engine: TTSEngine): Promise<Voice[]> {
    const client = await this.getClient(engine)
    if (!client) {
      throw new Error(`Browser engine ${engine} not available`)
    }

    try {
      const voices = await client.getVoices()
      return voices.map(voice => ({
        ...voice,
        engine: engine // Ensure engine is set correctly
      }))
    } catch (error) {
      console.error(`Error getting voices from browser engine ${engine}:`, error)
      throw error
    }
  }

  async synthesizeSpeech(
    text: string,
    engine: TTSEngine,
    voiceId: string,
    options?: { rate?: number; pitch?: number; volume?: number; format?: string }
  ): Promise<Uint8Array> {
    const client = await this.getClient(engine)
    if (!client) {
      throw new Error(`Browser engine ${engine} not available`)
    }

    try {
      // Set voice and properties
      client.setVoice(voiceId)

      if (options) {
        if (options.rate) client.setProperty("rate", options.rate)
        if (options.pitch) client.setProperty("pitch", options.pitch)
        if (options.volume) client.setProperty("volume", options.volume)
      }

      // Synthesize speech
      const audioBytes = await client.synthToBytes(text, options)
      return audioBytes
    } catch (error) {
      console.error(`Error synthesizing speech with browser engine ${engine}:`, error)
      throw error
    }
  }

  // Cleanup method
  destroy() {
    this.clients.clear()
    this.initialized.clear()
  }
}

// Singleton instance for browser TTS manager
let browserTTSManager: BrowserTTSManager | null = null

export function getBrowserTTSManager(): BrowserTTSManager {
  if (!browserTTSManager) {
    browserTTSManager = new BrowserTTSManager()
  }
  return browserTTSManager
}

// Utility functions for browser TTS
export async function getBrowserVoices(engine: TTSEngine): Promise<Voice[]> {
  const manager = getBrowserTTSManager()
  return manager.getVoices(engine)
}

export async function synthesizeBrowserSpeech(
  text: string,
  engine: TTSEngine,
  voiceId: string,
  options?: { rate?: number; pitch?: number; volume?: number; format?: string }
): Promise<Uint8Array> {
  const manager = getBrowserTTSManager()
  return manager.synthesizeSpeech(text, engine, voiceId, options)
}

export async function getBrowserAvailableEngines(): Promise<TTSEngine[]> {
  const manager = getBrowserTTSManager()
  return manager.getAvailableEngines()
}

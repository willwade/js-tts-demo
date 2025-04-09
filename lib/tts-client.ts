"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

// Define types for TTS engines
export type TTSEngine = "azure" | "elevenlabs" | "google" | "openai" | "playht" | "polly" | "sherpaonnx"

export interface Voice {
  id: string
  name: string
  engine: TTSEngine
  languageCodes: { code: string; display: string }[]
  gender?: string
  preview?: string
}

export interface TTSCredentials {
  azure: {
    subscriptionKey: string
    region: string
    enabled: boolean
  }
  elevenlabs: {
    apiKey: string
    enabled: boolean
  }
  google: {
    keyFilename: string
    enabled: boolean
  }
  openai: {
    apiKey: string
    enabled: boolean
  }
  playht: {
    apiKey: string
    userId: string
    enabled: boolean
  }
  polly: {
    accessKeyId: string
    secretAccessKey: string
    region: string
    enabled: boolean
  }
  sherpaonnx: {
    enabled: boolean
  }
}

// Define store for TTS state
interface TTSState {
  credentials: TTSCredentials
  voices: Voice[]
  selectedVoice: Voice | null
  isLoading: boolean
  audioUrl: string | null
  isPlaying: boolean
  setCredentials: (engine: TTSEngine, credentials: Partial<any>) => void
  toggleEngine: (engine: TTSEngine) => void
  setVoices: (voices: Voice[]) => void
  setSelectedVoice: (voice: Voice | null) => void
  setIsLoading: (isLoading: boolean) => void
  setAudioUrl: (url: string | null) => void
  setIsPlaying: (isPlaying: boolean) => void
}

// Create store with persistence
export const useTTSStore = create<TTSState>()(
  persist(
    (set) => ({
      credentials: {
        azure: {
          subscriptionKey: "",
          region: "",
          enabled: true,
        },
        elevenlabs: {
          apiKey: "",
          enabled: true,
        },
        google: {
          keyFilename: "",
          enabled: true,
        },
        openai: {
          apiKey: "",
          enabled: true,
        },
        playht: {
          apiKey: "",
          userId: "",
          enabled: true,
        },
        polly: {
          accessKeyId: "",
          secretAccessKey: "",
          region: "",
          enabled: true,
        },
        sherpaonnx: {
          enabled: true,
        },
      },
      voices: [],
      selectedVoice: null,
      isLoading: false,
      audioUrl: null,
      isPlaying: false,
      setCredentials: (engine, credentials) =>
        set((state) => ({
          credentials: {
            ...state.credentials,
            [engine]: {
              ...state.credentials[engine],
              ...credentials,
            },
          },
        })),
      toggleEngine: (engine) =>
        set((state) => ({
          credentials: {
            ...state.credentials,
            [engine]: {
              ...state.credentials[engine],
              enabled: !state.credentials[engine].enabled,
            },
          },
        })),
      setVoices: (voices) => set({ voices }),
      setSelectedVoice: (selectedVoice) => set({ selectedVoice }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setAudioUrl: (audioUrl) => set({ audioUrl }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
    }),
    {
      name: "tts-storage",
      partialize: (state) => ({
        credentials: state.credentials,
        selectedVoice: state.selectedVoice,
      }),
    },
  ),
)

// Function to fetch voices from the API
export async function fetchVoices(engine: TTSEngine, credentials: any): Promise<Voice[]> {
  try {
    // Call the API to get voices
    const response = await fetch(`/api/voices?engine=${engine}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch voices: ${response.statusText}`);
    }

    const voices = await response.json();
    return voices;
  } catch (error) {
    console.error(`Error fetching voices for ${engine}:`, error);
    throw error;
  }
}

// Function to synthesize speech using the API
export async function synthesizeSpeech(text: string, voice: Voice, options?: { rate?: number; pitch?: number; volume?: number; format?: string }): Promise<string> {
  try {
    // Call the API to synthesize speech
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        engine: voice.engine,
        voiceId: voice.id,
        options,
      }),
    });

    if (!response.ok) {
      // Try to get error details if available
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to synthesize speech: ${response.statusText}`);
      } catch (e) {
        throw new Error(`Failed to synthesize speech: ${response.statusText}`);
      }
    }

    // Get the audio data as a blob
    const audioBlob = await response.blob();

    // Create a blob URL for the audio
    const audioUrl = URL.createObjectURL(audioBlob);

    return audioUrl;
  } catch (error) {
    console.error(`Error synthesizing speech with ${voice.engine}:`, error);
    throw error;
  }
}

// Function to save audio as WAV
export async function saveAudioAsWav(audioUrl: string, filename: string): Promise<void> {
  try {
    const response = await fetch(audioUrl)
    const blob = await response.blob()

    // Create a download link
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.style.display = "none"
    a.href = url
    a.download = filename || "tts-audio.wav"

    // Append to the document and trigger the download
    document.body.appendChild(a)
    a.click()

    // Clean up
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error("Failed to save audio:", error)
    throw error
  }
}

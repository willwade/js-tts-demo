"use client"

import { useCallback, useEffect, useState } from "react"
import { TTSEngine, TTSMode, Voice, useHydratedTTSStore } from "@/lib/tts-client"
import { getBrowserTTSManager, synthesizeBrowserSpeech } from "@/lib/browser-tts"
import { TTSModeUtils, getEffectiveMode, getBestEngine } from "@/lib/tts-mode"
import { getEngineConfig } from "@/lib/tts-config"
import { useToast } from "@/components/ui/use-toast"

export interface UseTTSOptions {
  preferredMode?: TTSMode
  autoDetect?: boolean
  fallbackToServer?: boolean
  fallbackToBrowser?: boolean
}

export interface TTSHookResult {
  // State
  currentMode: TTSMode
  effectiveMode: TTSMode
  isLoading: boolean
  availableEngines: TTSEngine[]
  browserEngines: TTSEngine[]
  serverEngines: TTSEngine[]

  // Voice management
  getVoices: (engine?: TTSEngine, mode?: TTSMode) => Promise<Voice[]>
  getAllVoices: (mode?: TTSMode) => Promise<Voice[]>

  // Speech synthesis
  synthesizeSpeech: (
    text: string,
    voice: Voice,
    options?: { rate?: number; pitch?: number; volume?: number; format?: string },
    mode?: TTSMode
  ) => Promise<string>

  // Mode management
  setMode: (mode: TTSMode) => void
  canUseMode: (mode: TTSMode) => boolean

  // Engine management
  isEngineAvailable: (engine: TTSEngine, mode?: TTSMode) => Promise<boolean>
  getBestEngineForMode: (mode?: TTSMode) => TTSEngine | null
}

export function useTTS(options: UseTTSOptions = {}): TTSHookResult {
  const {
    preferredMode = 'auto',
    autoDetect = true,
    fallbackToServer = true,
    fallbackToBrowser = true
  } = options

  const { credentials, voices, setVoices } = useHydratedTTSStore()
  const { toast } = useToast()

  const [currentMode, setCurrentMode] = useState<TTSMode>(preferredMode)
  const [isLoading, setIsLoading] = useState(false)
  const [availableEngines, setAvailableEngines] = useState<TTSEngine[]>([])
  const [browserEngines, setBrowserEngines] = useState<TTSEngine[]>([])
  const [serverEngines, setServerEngines] = useState<TTSEngine[]>([])

  // Get effective mode based on environment and available engines
  const effectiveMode = getEffectiveMode(currentMode, availableEngines)

  // Initialize available engines
  useEffect(() => {
    const initializeEngines = async () => {
      try {
        // Get enabled engines from credentials
        const enabledEngines = Object.entries(credentials)
          .filter(([_, config]) => config.enabled)
          .map(([engine]) => engine as TTSEngine)

        setAvailableEngines(enabledEngines)

        // Get browser engines
        if (TTSModeUtils.isBrowser()) {
          const browserManager = getBrowserTTSManager()
          const browserAvailable = await browserManager.getAvailableEngines()
          const filteredBrowserEngines = browserAvailable.filter(engine => enabledEngines.includes(engine))
          setBrowserEngines(filteredBrowserEngines)
        }

        // Server engines are those that can be used via API
        const serverAvailable = enabledEngines.filter(engine => {
          const config = getEngineConfig(engine)
          return config.type === 'server' || config.type === 'hybrid'
        })
        setServerEngines(serverAvailable)

      } catch (error) {
        console.error('Error initializing engines:', error)
      }
    }

    initializeEngines()
  }, [credentials])

  // Auto-detect mode if enabled
  useEffect(() => {
    if (autoDetect && currentMode === 'auto') {
      const detectedMode = TTSModeUtils.autoDetectMode(availableEngines)
      if (detectedMode !== 'auto') {
        setCurrentMode(detectedMode)
      }
    }
  }, [autoDetect, currentMode, availableEngines])

  // Get voices for a specific engine
  const getVoices = useCallback(async (engine?: TTSEngine, mode?: TTSMode): Promise<Voice[]> => {
    const targetMode = mode || effectiveMode
    const targetEngine = engine

    if (!targetEngine) {
      throw new Error('Engine must be specified')
    }

    setIsLoading(true)
    try {
      // Check if engine is available for the target mode
      const engineConfig = getEngineConfig(targetEngine)

      if (targetMode === 'browser' || (targetMode === 'hybrid' && TTSModeUtils.isBrowser())) {
        // Use browser TTS
        if (engineConfig.type === 'browser' || engineConfig.type === 'hybrid') {
          const browserManager = getBrowserTTSManager()
          return await browserManager.getVoices(targetEngine)
        } else {
          throw new Error(`Engine ${targetEngine} not available in browser mode`)
        }
      } else {
        // Use server API
        const response = await fetch(`/api/voices?engine=${targetEngine}&mode=${targetMode}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to fetch voices: ${response.statusText}`)
        }

        return await response.json()
      }
    } catch (error) {
      console.error(`Error fetching voices for ${targetEngine}:`, error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [effectiveMode])

  // Get all voices for the current mode
  const getAllVoices = useCallback(async (mode?: TTSMode): Promise<Voice[]> => {
    const targetMode = mode || effectiveMode
    const engines = targetMode === 'browser' ? browserEngines :
                   targetMode === 'server' ? serverEngines :
                   availableEngines

    setIsLoading(true)
    try {
      const voicesPromises = engines.map(async (engine) => {
        try {
          return await getVoices(engine, targetMode)
        } catch (error) {
          console.error(`Error loading ${engine} voices:`, error)
          return []
        }
      })

      const allVoicesResults = await Promise.all(voicesPromises)
      const allVoices = allVoicesResults.flat()

      // Update store
      setVoices(allVoices)

      return allVoices
    } finally {
      setIsLoading(false)
    }
  }, [effectiveMode, browserEngines, serverEngines, availableEngines, getVoices, setVoices])

  // Synthesize speech
  const synthesizeSpeech = useCallback(async (
    text: string,
    voice: Voice,
    options?: { rate?: number; pitch?: number; volume?: number; format?: string },
    mode?: TTSMode
  ): Promise<string> => {
    const targetMode = mode || effectiveMode
    const engineConfig = getEngineConfig(voice.engine)

    setIsLoading(true)
    try {
      if (targetMode === 'browser' || (targetMode === 'hybrid' && TTSModeUtils.isBrowser() && engineConfig.type !== 'server')) {
        // Use browser TTS
        const audioBytes = await synthesizeBrowserSpeech(text, voice.engine, voice.id, options)

        // Convert to blob URL
        const audioBlob = new Blob([audioBytes], { type: 'audio/wav' })
        return URL.createObjectURL(audioBlob)
      } else {
        // Use server API
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            engine: voice.engine,
            voiceId: voice.id,
            options: { ...options, mode: targetMode },
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to synthesize speech: ${response.statusText}`)
        }

        const audioBlob = await response.blob()
        return URL.createObjectURL(audioBlob)
      }
    } catch (error) {
      console.error(`Error synthesizing speech with ${voice.engine}:`, error)

      // Try fallback modes
      if (targetMode !== 'browser' && fallbackToBrowser && browserEngines.includes(voice.engine)) {
        console.log('Falling back to browser mode...')
        return synthesizeSpeech(text, voice, options, 'browser')
      }

      if (targetMode !== 'server' && fallbackToServer && serverEngines.includes(voice.engine)) {
        console.log('Falling back to server mode...')
        return synthesizeSpeech(text, voice, options, 'server')
      }

      throw error
    } finally {
      setIsLoading(false)
    }
  }, [effectiveMode, browserEngines, serverEngines, fallbackToBrowser, fallbackToServer])

  // Set mode
  const setMode = useCallback((mode: TTSMode) => {
    setCurrentMode(mode)
  }, [])

  // Check if mode can be used
  const canUseMode = useCallback((mode: TTSMode): boolean => {
    return TTSModeUtils.isModeCompatible(mode)
  }, [])

  // Check if engine is available for mode
  const isEngineAvailable = useCallback(async (engine: TTSEngine, mode?: TTSMode): Promise<boolean> => {
    const targetMode = mode || effectiveMode
    const engineConfig = getEngineConfig(engine)

    // Check if engine is enabled
    if (!credentials[engine]?.enabled) {
      return false
    }

    // Check mode compatibility
    if (targetMode === 'browser' && engineConfig.type === 'server') {
      return false
    }

    if (targetMode === 'server' && engineConfig.type === 'browser' && !TTSModeUtils.canAccessAPI()) {
      return false
    }

    // For browser engines, check actual availability
    if (targetMode === 'browser' || engineConfig.type === 'browser') {
      const browserManager = getBrowserTTSManager()
      return await browserManager.isEngineAvailable(engine)
    }

    return true
  }, [effectiveMode, credentials])

  // Get best engine for mode
  const getBestEngineForMode = useCallback((mode?: TTSMode): TTSEngine | null => {
    const targetMode = mode || effectiveMode
    const engines = targetMode === 'browser' ? browserEngines :
                   targetMode === 'server' ? serverEngines :
                   availableEngines

    return getBestEngine(targetMode, engines)
  }, [effectiveMode, browserEngines, serverEngines, availableEngines])

  return {
    // State
    currentMode,
    effectiveMode,
    isLoading,
    availableEngines,
    browserEngines,
    serverEngines,

    // Voice management
    getVoices,
    getAllVoices,

    // Speech synthesis
    synthesizeSpeech,

    // Mode management
    setMode,
    canUseMode,

    // Engine management
    isEngineAvailable,
    getBestEngineForMode
  }
}

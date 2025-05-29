import { TTSMode, TTSEngine } from "./tts-client"
import { getEngineConfig, getEnginesForMode, getPreferredEngine } from "./tts-config"

export interface TTSModeInfo {
  mode: TTSMode
  isServer: boolean
  isBrowser: boolean
  supportsOffline: boolean
  description: string
}

// Environment detection
export function detectEnvironment(): 'server' | 'browser' {
  return typeof window !== 'undefined' ? 'browser' : 'server'
}

// Check if we're in a server-side rendering context
export function isSSR(): boolean {
  return typeof window === 'undefined'
}

// Check if we're in a browser context
export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

// Check if we're running in a Next.js API route
export function isAPIRoute(): boolean {
  return isSSR() && typeof process !== 'undefined' && process.env.NODE_ENV !== undefined
}

// Get mode information
export function getModeInfo(mode: TTSMode): TTSModeInfo {
  const modeInfoMap: Record<TTSMode, TTSModeInfo> = {
    server: {
      mode: 'server',
      isServer: true,
      isBrowser: false,
      supportsOffline: false,
      description: 'Server-side TTS with cloud engines for best quality and voice selection'
    },
    browser: {
      mode: 'browser',
      isServer: false,
      isBrowser: true,
      supportsOffline: true,
      description: 'Client-side TTS with WebAssembly engines for offline capability'
    },
    hybrid: {
      mode: 'hybrid',
      isServer: true,
      isBrowser: true,
      supportsOffline: true,
      description: 'Flexible TTS that can use both server and browser engines'
    },
    auto: {
      mode: 'auto',
      isServer: true,
      isBrowser: true,
      supportsOffline: true,
      description: 'Automatically selects the best available TTS mode based on environment'
    }
  }
  
  return modeInfoMap[mode]
}

// Auto-detect the best mode based on environment and available engines
export function autoDetectMode(availableEngines: TTSEngine[]): TTSMode {
  const environment = detectEnvironment()
  
  // If we're in a browser environment
  if (environment === 'browser') {
    // Check if we have browser-compatible engines
    const browserEngines = getEnginesForMode('browser')
    const hasBrowserEngines = availableEngines.some(engine => browserEngines.includes(engine))
    
    if (hasBrowserEngines) {
      return 'browser'
    }
    
    // Fallback to hybrid if we have server engines but are in browser
    return 'hybrid'
  }
  
  // If we're in a server environment
  if (environment === 'server') {
    // Prefer server mode for API routes
    const serverEngines = getEnginesForMode('server')
    const hasServerEngines = availableEngines.some(engine => serverEngines.includes(engine))
    
    if (hasServerEngines) {
      return 'server'
    }
    
    // Fallback to hybrid
    return 'hybrid'
  }
  
  // Default fallback
  return 'hybrid'
}

// Validate if a mode is compatible with the current environment
export function isModeCompatible(mode: TTSMode, environment?: 'server' | 'browser'): boolean {
  const env = environment || detectEnvironment()
  
  switch (mode) {
    case 'server':
      // Server mode requires server environment or API access
      return env === 'server' || (env === 'browser' && canAccessAPI())
    case 'browser':
      // Browser mode requires browser environment
      return env === 'browser'
    case 'hybrid':
    case 'auto':
      // Hybrid and auto modes are always compatible
      return true
    default:
      return false
  }
}

// Check if browser can access server API
export function canAccessAPI(): boolean {
  return isBrowser() && typeof fetch !== 'undefined'
}

// Get the effective mode for execution
export function getEffectiveMode(requestedMode: TTSMode, availableEngines: TTSEngine[]): TTSMode {
  const environment = detectEnvironment()
  
  // If mode is auto, detect the best mode
  if (requestedMode === 'auto') {
    return autoDetectMode(availableEngines)
  }
  
  // Check if requested mode is compatible
  if (!isModeCompatible(requestedMode, environment)) {
    console.warn(`Mode ${requestedMode} is not compatible with ${environment} environment, falling back to auto-detection`)
    return autoDetectMode(availableEngines)
  }
  
  return requestedMode
}

// Get engines that are compatible with the current mode and environment
export function getCompatibleEngines(mode: TTSMode, availableEngines: TTSEngine[]): TTSEngine[] {
  const effectiveMode = getEffectiveMode(mode, availableEngines)
  const modeEngines = getEnginesForMode(effectiveMode)
  
  return availableEngines.filter(engine => {
    const config = getEngineConfig(engine)
    
    // Check if engine is compatible with the mode
    if (!modeEngines.includes(engine)) {
      return false
    }
    
    // Additional environment-specific checks
    const environment = detectEnvironment()
    
    if (environment === 'browser' && config.type === 'server' && effectiveMode === 'browser') {
      return false
    }
    
    if (environment === 'server' && config.type === 'browser' && effectiveMode === 'server') {
      return false
    }
    
    return true
  })
}

// Get the best engine for the current mode and environment
export function getBestEngine(mode: TTSMode, availableEngines: TTSEngine[]): TTSEngine | null {
  const compatibleEngines = getCompatibleEngines(mode, availableEngines)
  const effectiveMode = getEffectiveMode(mode, availableEngines)
  
  return getPreferredEngine(effectiveMode, compatibleEngines)
}

// Check if offline mode is available
export function isOfflineModeAvailable(availableEngines: TTSEngine[]): boolean {
  return availableEngines.some(engine => {
    const config = getEngineConfig(engine)
    return config.supportsOffline
  })
}

// Get offline-capable engines
export function getOfflineEngines(availableEngines: TTSEngine[]): TTSEngine[] {
  return availableEngines.filter(engine => {
    const config = getEngineConfig(engine)
    return config.supportsOffline
  })
}

// Mode selection utilities
export const TTSModeUtils = {
  detectEnvironment,
  isSSR,
  isBrowser,
  isAPIRoute,
  getModeInfo,
  autoDetectMode,
  isModeCompatible,
  canAccessAPI,
  getEffectiveMode,
  getCompatibleEngines,
  getBestEngine,
  isOfflineModeAvailable,
  getOfflineEngines
}

export default TTSModeUtils

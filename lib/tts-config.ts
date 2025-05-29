import { TTSEngine, TTSMode } from "./tts-client"

export interface TTSEngineConfig {
  id: TTSEngine
  name: string
  type: 'server' | 'browser' | 'hybrid'
  serverEngine?: TTSEngine
  browserEngine?: TTSEngine
  requiresCredentials: boolean
  supportsOffline: boolean
  description: string
  capabilities: {
    voiceCount: 'low' | 'medium' | 'high'
    quality: 'low' | 'medium' | 'high'
    speed: 'slow' | 'medium' | 'fast'
    languages: 'limited' | 'good' | 'extensive'
  }
}

// Engine configurations mapping
export const TTS_ENGINE_CONFIGS: Record<TTSEngine, TTSEngineConfig> = {
  // Cloud-based engines (server-only)
  azure: {
    id: 'azure',
    name: 'Microsoft Azure',
    type: 'server',
    requiresCredentials: true,
    supportsOffline: false,
    description: 'High-quality neural voices from Microsoft Azure Cognitive Services',
    capabilities: {
      voiceCount: 'high',
      quality: 'high',
      speed: 'fast',
      languages: 'extensive'
    }
  },
  elevenlabs: {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    type: 'server',
    requiresCredentials: true,
    supportsOffline: false,
    description: 'AI-powered voice synthesis with natural-sounding voices',
    capabilities: {
      voiceCount: 'medium',
      quality: 'high',
      speed: 'medium',
      languages: 'good'
    }
  },
  google: {
    id: 'google',
    name: 'Google Cloud TTS',
    type: 'server',
    requiresCredentials: true,
    supportsOffline: false,
    description: 'Google Cloud Text-to-Speech with WaveNet voices',
    capabilities: {
      voiceCount: 'high',
      quality: 'high',
      speed: 'fast',
      languages: 'extensive'
    }
  },
  openai: {
    id: 'openai',
    name: 'OpenAI TTS',
    type: 'server',
    requiresCredentials: true,
    supportsOffline: false,
    description: 'OpenAI text-to-speech with natural voices',
    capabilities: {
      voiceCount: 'low',
      quality: 'high',
      speed: 'fast',
      languages: 'good'
    }
  },
  playht: {
    id: 'playht',
    name: 'PlayHT',
    type: 'server',
    requiresCredentials: true,
    supportsOffline: false,
    description: 'AI voice generation platform with realistic voices',
    capabilities: {
      voiceCount: 'high',
      quality: 'high',
      speed: 'medium',
      languages: 'good'
    }
  },
  polly: {
    id: 'polly',
    name: 'Amazon Polly',
    type: 'server',
    requiresCredentials: true,
    supportsOffline: false,
    description: 'Amazon Polly text-to-speech service',
    capabilities: {
      voiceCount: 'high',
      quality: 'high',
      speed: 'fast',
      languages: 'extensive'
    }
  },
  watson: {
    id: 'watson',
    name: 'IBM Watson',
    type: 'server',
    requiresCredentials: true,
    supportsOffline: false,
    description: 'IBM Watson Text to Speech service',
    capabilities: {
      voiceCount: 'medium',
      quality: 'high',
      speed: 'medium',
      languages: 'good'
    }
  },
  witai: {
    id: 'witai',
    name: 'Wit.ai',
    type: 'server',
    requiresCredentials: true,
    supportsOffline: false,
    description: 'Meta Wit.ai speech synthesis',
    capabilities: {
      voiceCount: 'low',
      quality: 'medium',
      speed: 'medium',
      languages: 'limited'
    }
  },

  // Hybrid engines (both server and browser)
  espeak: {
    id: 'espeak',
    name: 'eSpeak (Server)',
    type: 'server',
    serverEngine: 'espeak',
    browserEngine: 'espeak-wasm',
    requiresCredentials: false,
    supportsOffline: true,
    description: 'Open-source speech synthesizer (server-side)',
    capabilities: {
      voiceCount: 'medium',
      quality: 'medium',
      speed: 'fast',
      languages: 'extensive'
    }
  },
  'espeak-wasm': {
    id: 'espeak-wasm',
    name: 'eSpeak (Browser)',
    type: 'browser',
    serverEngine: 'espeak',
    browserEngine: 'espeak-wasm',
    requiresCredentials: false,
    supportsOffline: true,
    description: 'Open-source speech synthesizer (browser WebAssembly)',
    capabilities: {
      voiceCount: 'medium',
      quality: 'medium',
      speed: 'fast',
      languages: 'extensive'
    }
  },

  // SherpaOnnx engines
  sherpaonnx: {
    id: 'sherpaonnx',
    name: 'SherpaOnnx (Server)',
    type: 'server',
    serverEngine: 'sherpaonnx',
    browserEngine: 'sherpaonnx-wasm',
    requiresCredentials: false,
    supportsOffline: true,
    description: 'High-quality neural TTS (server-side)',
    capabilities: {
      voiceCount: 'high',
      quality: 'high',
      speed: 'medium',
      languages: 'extensive'
    }
  },
  'sherpaonnx-wasm': {
    id: 'sherpaonnx-wasm',
    name: 'SherpaOnnx (Browser)',
    type: 'browser',
    serverEngine: 'sherpaonnx',
    browserEngine: 'sherpaonnx-wasm',
    requiresCredentials: false,
    supportsOffline: true,
    description: 'High-quality neural TTS (browser WebAssembly)',
    capabilities: {
      voiceCount: 'high',
      quality: 'high',
      speed: 'medium',
      languages: 'extensive'
    }
  },

  // Mock engine for testing
  mock: {
    id: 'mock',
    name: 'Mock TTS',
    type: 'hybrid',
    requiresCredentials: false,
    supportsOffline: true,
    description: 'Mock TTS engine for testing purposes',
    capabilities: {
      voiceCount: 'low',
      quality: 'low',
      speed: 'fast',
      languages: 'limited'
    }
  }
}

// Helper functions
export function getEngineConfig(engine: TTSEngine): TTSEngineConfig {
  return TTS_ENGINE_CONFIGS[engine]
}

export function getServerEngines(): TTSEngine[] {
  return Object.values(TTS_ENGINE_CONFIGS)
    .filter(config => config.type === 'server' || config.type === 'hybrid')
    .map(config => config.id)
}

export function getBrowserEngines(): TTSEngine[] {
  return Object.values(TTS_ENGINE_CONFIGS)
    .filter(config => config.type === 'browser' || config.type === 'hybrid')
    .map(config => config.id)
}

export function getOfflineEngines(): TTSEngine[] {
  return Object.values(TTS_ENGINE_CONFIGS)
    .filter(config => config.supportsOffline)
    .map(config => config.id)
}

export function getEnginesForMode(mode: TTSMode): TTSEngine[] {
  switch (mode) {
    case 'server':
      return getServerEngines()
    case 'browser':
      return getBrowserEngines()
    case 'hybrid':
      return Object.values(TTS_ENGINE_CONFIGS)
        .filter(config => config.type === 'hybrid')
        .map(config => config.id)
    case 'auto':
    default:
      return Object.keys(TTS_ENGINE_CONFIGS) as TTSEngine[]
  }
}

export function getPreferredEngine(mode: TTSMode, availableEngines: TTSEngine[]): TTSEngine | null {
  const modeEngines = getEnginesForMode(mode)
  const compatibleEngines = availableEngines.filter(engine => modeEngines.includes(engine))
  
  if (compatibleEngines.length === 0) return null
  
  // Preference order based on mode
  const preferenceOrder: Record<TTSMode, TTSEngine[]> = {
    server: ['azure', 'google', 'elevenlabs', 'openai', 'polly', 'sherpaonnx', 'espeak'],
    browser: ['sherpaonnx-wasm', 'espeak-wasm', 'mock'],
    hybrid: ['sherpaonnx', 'espeak', 'sherpaonnx-wasm', 'espeak-wasm'],
    auto: ['azure', 'google', 'sherpaonnx', 'elevenlabs', 'sherpaonnx-wasm', 'espeak-wasm']
  }
  
  for (const engine of preferenceOrder[mode]) {
    if (compatibleEngines.includes(engine)) {
      return engine
    }
  }
  
  return compatibleEngines[0]
}

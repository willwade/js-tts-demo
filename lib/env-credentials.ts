/**
 * Environment Variable Credential Injection System
 * Automatically loads TTS credentials from environment variables
 */

import { TTSEngine, TTSCredentials } from "./tts-client"

// Environment variable mapping for each TTS engine
const ENV_VAR_MAPPING = {
  azure: {
    subscriptionKey: 'MICROSOFT_TOKEN',
    region: 'MICROSOFT_REGION',
  },
  elevenlabs: {
    apiKey: 'ELEVENLABS_API_KEY',
  },
  google: {
    keyFilename: 'GOOGLE_SA_PATH',
  },
  openai: {
    apiKey: 'OPENAI_API_KEY',
  },
  playht: {
    apiKey: 'PLAYHT_API_KEY',
    userId: 'PLAYHT_USER_ID',
  },
  polly: {
    accessKeyId: 'POLLY_AWS_KEY_ID',
    secretAccessKey: 'POLLY_AWS_ACCESS_KEY',
    region: 'POLLY_REGION',
  },
  watson: {
    apiKey: 'WATSON_API_KEY',
    url: 'WATSON_URL',
    region: 'WATSON_REGION',
    instanceId: 'WATSON_INSTANCE_ID',
  },
  witai: {
    token: 'WITAI_TOKEN',
  },
  // Server-only engines don't need credentials from env vars
  sherpaonnx: {},
  'sherpaonnx-wasm': {},
  espeak: {},
  'espeak-wasm': {},
  mock: {},
} as const

// Type for environment credential values
type EnvCredentialValue = string | undefined

// Helper function to get environment variable
function getEnvVar(key: string): EnvCredentialValue {
  // In browser environment, only NEXT_PUBLIC_ vars are available
  if (typeof window !== 'undefined') {
    return (window as any).__ENV__?.[key] || process.env[`NEXT_PUBLIC_${key}`]
  }
  
  // In server environment, all env vars are available
  return process.env[key]
}

// Check if an environment variable exists and has a value
function hasEnvVar(key: string): boolean {
  const value = getEnvVar(key)
  return value !== undefined && value !== null && value.trim() !== ''
}

// Load credentials for a specific engine from environment variables
export function loadEngineCredentialsFromEnv(engine: TTSEngine): Partial<any> {
  const mapping = ENV_VAR_MAPPING[engine]
  if (!mapping) return {}

  const credentials: any = {}
  let hasAnyCredential = false

  // Load each credential field from environment variables
  for (const [credField, envVar] of Object.entries(mapping)) {
    if (hasEnvVar(envVar)) {
      credentials[credField] = getEnvVar(envVar)
      hasAnyCredential = true
    }
  }

  // Only enable the engine if we have at least one credential
  if (hasAnyCredential) {
    credentials.enabled = true
  }

  return credentials
}

// Load all credentials from environment variables
export function loadAllCredentialsFromEnv(): Partial<TTSCredentials> {
  const credentials: Partial<TTSCredentials> = {}

  // Load credentials for each engine
  for (const engine of Object.keys(ENV_VAR_MAPPING) as TTSEngine[]) {
    const engineCredentials = loadEngineCredentialsFromEnv(engine)
    if (Object.keys(engineCredentials).length > 0) {
      credentials[engine] = engineCredentials
    }
  }

  return credentials
}

// Check which engines have credentials available
export function getEnginesWithCredentials(): TTSEngine[] {
  const engines: TTSEngine[] = []

  for (const engine of Object.keys(ENV_VAR_MAPPING) as TTSEngine[]) {
    const mapping = ENV_VAR_MAPPING[engine]
    
    // For engines without required credentials (like sherpaonnx, espeak, mock)
    if (Object.keys(mapping).length === 0) {
      engines.push(engine)
      continue
    }

    // Check if any required credential is available
    const hasCredentials = Object.values(mapping).some(envVar => hasEnvVar(envVar))
    if (hasCredentials) {
      engines.push(engine)
    }
  }

  return engines
}

// Get credential status for each engine
export function getCredentialStatus(): Record<TTSEngine, { 
  hasCredentials: boolean
  missingVars: string[]
  availableVars: string[]
}> {
  const status: any = {}

  for (const engine of Object.keys(ENV_VAR_MAPPING) as TTSEngine[]) {
    const mapping = ENV_VAR_MAPPING[engine]
    const missingVars: string[] = []
    const availableVars: string[] = []

    for (const envVar of Object.values(mapping)) {
      if (hasEnvVar(envVar)) {
        availableVars.push(envVar)
      } else {
        missingVars.push(envVar)
      }
    }

    status[engine] = {
      hasCredentials: availableVars.length > 0 || Object.keys(mapping).length === 0,
      missingVars,
      availableVars
    }
  }

  return status
}

// Merge environment credentials with existing credentials
export function mergeEnvCredentials(existingCredentials: TTSCredentials): TTSCredentials {
  const envCredentials = loadAllCredentialsFromEnv()
  const merged = { ...existingCredentials }

  // Merge each engine's credentials
  for (const [engine, envCreds] of Object.entries(envCredentials)) {
    if (envCreds && Object.keys(envCreds).length > 0) {
      merged[engine as TTSEngine] = {
        ...merged[engine as TTSEngine],
        ...envCreds
      }
    }
  }

  return merged
}

// Development helper: Log credential status
export function logCredentialStatus(): void {
  if (process.env.NODE_ENV === 'development') {
    const status = getCredentialStatus()
    const enginesWithCreds = getEnginesWithCredentials()
    
    console.log('🔑 TTS Credential Status:')
    console.log(`✅ Engines with credentials: ${enginesWithCreds.join(', ')}`)
    
    for (const [engine, engineStatus] of Object.entries(status)) {
      if (engineStatus.availableVars.length > 0) {
        console.log(`✅ ${engine}: ${engineStatus.availableVars.join(', ')}`)
      } else if (engineStatus.missingVars.length > 0) {
        console.log(`❌ ${engine}: Missing ${engineStatus.missingVars.join(', ')}`)
      } else {
        console.log(`ℹ️ ${engine}: No credentials required`)
      }
    }
  }
}

// Export environment variable mapping for reference
export { ENV_VAR_MAPPING }

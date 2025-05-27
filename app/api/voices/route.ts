import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

// Import TTS clients using the new unified structure
import {
  AzureTTSClient,
  ElevenLabsTTSClient,
  GoogleTTSClient,
  OpenAITTSClient,
  PlayHTTTSClient,
  PollyTTSClient,
  SherpaOnnxTTSClient,
  SherpaOnnxWasmTTSClient,
  EspeakTTSClient,
  EspeakWasmTTSClient,
  WatsonTTSClient,
  WitAITTSClient
} from "js-tts-wrapper";

// Mock TTS Client for testing (create a simple mock implementation)
class MockTTSClient {
  async checkCredentials() {
    return true;
  }

  async getVoices() {
    return [
      {
        id: 'mock-voice-1',
        name: 'Mock Voice 1',
        languageCodes: [{ bcp47: 'en-US', display: 'English (US)' }],
        gender: 'FEMALE'
      },
      {
        id: 'mock-voice-2',
        name: 'Mock Voice 2',
        languageCodes: [{ bcp47: 'en-GB', display: 'English (UK)' }],
        gender: 'MALE'
      }
    ];
  }

  setVoice(voiceId: string) {
    // Mock implementation
  }

  setProperty(property: string, value: any) {
    // Mock implementation
  }

  async synthToBytes(text: string, options?: any) {
    // Generate a simple sine wave as mock audio
    const sampleRate = 22050;
    const duration = 2; // seconds
    const numSamples = sampleRate * duration;
    const audioData = new Float32Array(numSamples);

    // Generate a simple sine wave
    const frequency = 440; // A4 note
    for (let i = 0; i < numSamples; i++) {
      audioData[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
    }

    // Convert to bytes (simplified)
    return new Uint8Array(audioData.buffer);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the engine from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const engine = searchParams.get("engine") as "azure" | "elevenlabs" | "google" | "openai" | "playht" | "polly" | "sherpaonnx" | "sherpaonnx-wasm" | "espeak" | "espeak-wasm" | "watson" | "witai" | "mock";
    const enabled = searchParams.get("enabled");

    if (!engine) {
      return NextResponse.json({ error: "Missing engine parameter" }, { status: 400 });
    }

    // If the engine is disabled, return an empty array
    if (enabled === "false") {
      return NextResponse.json([]);
    }

    // Create the appropriate TTS client based on the engine
    let client;
    try {
      switch (engine) {
        case "azure":
          client = new AzureTTSClient({
            subscriptionKey: process.env.MICROSOFT_TOKEN || "",
            region: process.env.MICROSOFT_REGION || "",
          });
          break;

        case "elevenlabs":
          client = new ElevenLabsTTSClient({
            apiKey: process.env.ELEVENLABS_API_KEY || "",
          });
          break;

        case "google":
          client = new GoogleTTSClient({
            keyFilename: process.env.GOOGLE_SA_PATH || "",
          });
          break;

        case "openai":
          client = new OpenAITTSClient({
            apiKey: process.env.OPENAI_API_KEY || "",
          });
          break;

        case "playht":
          client = new PlayHTTTSClient({
            apiKey: process.env.PLAYHT_API_KEY || "",
            userId: process.env.PLAYHT_USER_ID || "",
          });
          break;

        case "polly":
          client = new PollyTTSClient({
            region: process.env.POLLY_REGION || "",
            accessKeyId: process.env.POLLY_AWS_KEY_ID || "",
            secretAccessKey: process.env.POLLY_AWS_ACCESS_KEY || "",
          });
          break;

        case "sherpaonnx":
          // Use the dedicated SherpaOnnx server instead of direct client
          try {
            const sherpaPort = process.env.SHERPAONNX_PORT || 3002;
            const response = await fetch(`http://localhost:${sherpaPort}/voices`);
            if (!response.ok) {
              throw new Error(`SherpaOnnx server responded with status ${response.status}`);
            }
            const voices = await response.json();
            return NextResponse.json(voices);
          } catch (error: any) {
            console.error('Error fetching voices from SherpaOnnx server:', error);
            return NextResponse.json(
              { error: `Failed to fetch SherpaOnnx voices: ${error?.message || 'Unknown error'}` },
              { status: 500 }
            );
          }

        case "sherpaonnx-wasm":
          client = new SherpaOnnxWasmTTSClient({
            wasmPath: process.env.SHERPAONNX_WASM_PATH || null
          });
          break;

        case "espeak":
          client = new EspeakTTSClient();
          break;

        case "espeak-wasm":
          client = new EspeakWasmTTSClient();
          break;

        case "watson":
          client = new WatsonTTSClient({
            apiKey: process.env.WATSON_API_KEY || "",
            url: process.env.WATSON_URL || "",
            region: process.env.WATSON_REGION || "us-south",
            instanceId: process.env.WATSON_INSTANCE_ID || "",
          });
          break;

        case "witai":
          client = new WitAITTSClient({
            token: process.env.WITAI_TOKEN || "",
          });
          break;

        case "mock":
          client = new MockTTSClient();
          break;

        default:
          return NextResponse.json({ error: `Unsupported engine: ${engine}` }, { status: 400 });
      }

      // Check if credentials are valid
      try {
        const credentialsValid = await client.checkCredentials();
        if (!credentialsValid) {
          return NextResponse.json(
            { error: `Invalid credentials for ${engine} TTS engine` },
            { status: 401 }
          );
        }
      } catch (error: any) {
        console.error(`Error checking credentials for ${engine} TTS engine:`, error);

        // For SherpaOnnx, we want to continue even if credentials check fails
        if ((engine as string) === 'sherpaonnx') {
          console.log('SherpaOnnx model files not available. Using mock implementation for example.');
        } else {
          return NextResponse.json(
            { error: `Error checking credentials for ${engine} TTS engine: ${error?.message || 'Unknown error'}` },
            { status: 500 }
          );
        }
      }
    } catch (error: any) {
      console.error(`Error creating ${engine} TTS client:`, error);
      return NextResponse.json(
        { error: `Failed to initialize ${engine} TTS engine: ${error?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Get the voices
    const voices = await client.getVoices();

    // Transform the voices to match the expected format
    const transformedVoices = voices.map((voice) => ({
      id: voice.id,
      name: voice.name,
      engine: engine,
      languageCodes: voice.languageCodes.map((lc) => ({
        code: lc.bcp47,
        display: lc.display,
      })),
      gender: voice.gender,
    }));

    return NextResponse.json(transformedVoices);
  } catch (error: any) {
    console.error("Error fetching voices:", error);
    return NextResponse.json(
      { error: "Failed to fetch voices: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

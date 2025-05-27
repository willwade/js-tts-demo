import { type NextRequest, NextResponse } from "next/server";

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

/**
 * Convert a Float32Array to WAV format
 */
function float32ArrayToWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // Write WAV header
  // "RIFF" chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');

  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // subchunk1Size
  view.setUint16(20, 1, true); // audioFormat (PCM)
  view.setUint16(22, 1, true); // numChannels
  view.setUint32(24, sampleRate, true); // sampleRate
  view.setUint32(28, sampleRate * 2, true); // byteRate
  view.setUint16(32, 2, true); // blockAlign
  view.setUint16(34, 16, true); // bitsPerSample

  // "data" sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true); // subchunk2Size

  // Write audio data
  const volume = 0.5;
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i])) * volume;
    const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    view.setInt16(44 + i * 2, int16, true);
  }

  return buffer;
}

/**
 * Helper method to write a string to a DataView
 */
function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, engine, voiceId, options } = await request.json();

    // Validate request
    if (!text || !engine || !voiceId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
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
            const response = await fetch(`http://localhost:${sherpaPort}/tts`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                text,
                voiceId,
                options: {}
              })
            });

            if (!response.ok) {
              throw new Error(`SherpaOnnx server responded with status ${response.status}`);
            }

            const audioBuffer = await response.arrayBuffer();
            return new NextResponse(audioBuffer, {
              headers: {
                'Content-Type': 'audio/wav',
                'Content-Length': audioBuffer.byteLength.toString(),
              },
            });
          } catch (error: any) {
            console.error('Error synthesizing speech with SherpaOnnx server:', error);
            return NextResponse.json(
              { error: `Failed to synthesize speech with SherpaOnnx: ${error?.message || 'Unknown error'}` },
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
      const credentialsValid = await client.checkCredentials();
      if (!credentialsValid) {
        return NextResponse.json(
          { error: `Invalid credentials for ${engine} TTS engine` },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error(`Error creating ${engine} TTS client:`, error);
      return NextResponse.json(
        { error: `Failed to initialize ${engine} TTS engine` },
        { status: 500 }
      );
    }

    // Set the voice
    client.setVoice(voiceId);

    // Apply any additional options
    if (options) {
      if (options.rate) client.setProperty("rate", options.rate);
      if (options.pitch) client.setProperty("pitch", options.pitch);
      if (options.volume) client.setProperty("volume", options.volume);
    }

    // Synthesize the speech
    const audioFormat = options?.format || "mp3";
    const audioBytes = await client.synthToBytes(text, { format: audioFormat });

    // Return the audio data
    return new NextResponse(audioBytes, {
      headers: {
        "Content-Type": audioFormat === "mp3" ? "audio/mp3" : "audio/wav",
        "Content-Disposition": `attachment; filename="tts-output.${audioFormat}"`
      },
    });
  } catch (error: any) {
    console.error("Error processing TTS request:", error);
    return NextResponse.json(
      { error: "Failed to process TTS request: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

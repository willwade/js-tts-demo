import { type NextRequest, NextResponse } from "next/server";
import {
  AzureTTSClient,
  ElevenLabsTTSClient,
  GoogleTTSClient,
  OpenAITTSClient,
  PlayHTTTSClient,
  PollyTTSClient,
  SherpaOnnxTTSClient,
} from "js-tts-wrapper";

// Import fetch polyfill
import "@/lib/fetch-polyfill";

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
          client = new SherpaOnnxTTSClient({});
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
  } catch (error) {
    console.error("Error processing TTS request:", error);
    return NextResponse.json(
      { error: "Failed to process TTS request: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

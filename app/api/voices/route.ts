import { NextRequest, NextResponse } from "next/server";
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

export async function GET(request: NextRequest) {
  try {
    // Get the engine from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const engine = searchParams.get("engine");

    if (!engine) {
      return NextResponse.json({ error: "Missing engine parameter" }, { status: 400 });
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
  } catch (error) {
    console.error("Error fetching voices:", error);
    return NextResponse.json(
      { error: "Failed to fetch voices: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

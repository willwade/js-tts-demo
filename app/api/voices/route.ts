import { NextRequest, NextResponse } from "next/server";

// Import each client individually to avoid importing SherpaOnnx
import { AzureTTSClient } from "js-tts-wrapper/engines/azure";
import { ElevenLabsTTSClient } from "js-tts-wrapper/engines/elevenlabs";
import { GoogleTTSClient } from "js-tts-wrapper/engines/google";
import { OpenAITTSClient } from "js-tts-wrapper/engines/openai";
import { PlayHTTTSClient } from "js-tts-wrapper/engines/playht";
import { PollyTTSClient } from "js-tts-wrapper/engines/polly";

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
          // For SherpaOnnx, we'll proxy the request to the dedicated SherpaOnnx API route
          try {
            // Make a request to the standalone SherpaOnnx server
            const response = await fetch(`http://localhost:3002/voices`);

            if (!response.ok) {
              let errorMessage = 'Failed to get SherpaOnnx voices';
              try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
              } catch (e) {
                // If the response is not JSON, use the status text
                errorMessage = `Failed to get SherpaOnnx voices: ${response.statusText}`;
              }
              return NextResponse.json(
                { error: errorMessage },
                { status: response.status }
              );
            }

            // Return the voices directly
            const voices = await response.json();
            console.log(`SherpaOnnx API returned ${voices.length} voices. First voice:`, voices[0]);
            return NextResponse.json(voices);
          } catch (error) {
            console.error('Error proxying to SherpaOnnx API:', error);
            return NextResponse.json(
              { error: `Failed to get SherpaOnnx voices: ${error.message}` },
              { status: 500 }
            );
          }
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
      } catch (error) {
        console.error(`Error checking credentials for ${engine} TTS engine:`, error);

        // For SherpaOnnx, we want to continue even if credentials check fails
        if (engine === 'sherpaonnx') {
          console.log('SherpaOnnx model files not available. Using mock implementation for example.');
        } else {
          return NextResponse.json(
            { error: `Error checking credentials for ${engine} TTS engine: ${error.message}` },
            { status: 500 }
          );
        }
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

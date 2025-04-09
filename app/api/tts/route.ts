import { type NextRequest, NextResponse } from "next/server";

// Import each client individually to avoid importing SherpaOnnx
import { AzureTTSClient } from "js-tts-wrapper/engines/azure";
import { ElevenLabsTTSClient } from "js-tts-wrapper/engines/elevenlabs";
import { GoogleTTSClient } from "js-tts-wrapper/engines/google";
import { OpenAITTSClient } from "js-tts-wrapper/engines/openai";
import { PlayHTTTSClient } from "js-tts-wrapper/engines/playht";
import { PollyTTSClient } from "js-tts-wrapper/engines/polly";

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
          // For SherpaOnnx, we'll proxy the request to the dedicated SherpaOnnx API route
          try {
            // Make a request to the standalone SherpaOnnx server
            const response = await fetch(`http://localhost:3002/tts`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ text, voiceId, options }),
            });

            if (!response.ok) {
              let errorMessage = 'Failed to synthesize speech with SherpaOnnx';
              try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
              } catch (e) {
                // If the response is not JSON, use the status text
                errorMessage = `Failed to synthesize speech with SherpaOnnx: ${response.statusText}`;
              }
              return NextResponse.json(
                { error: errorMessage },
                { status: response.status }
              );
            }

            // Get the audio buffer from the response
            const audioBuffer = await response.arrayBuffer();

            // Return the audio as a response
            return new NextResponse(audioBuffer, {
              headers: {
                'Content-Type': 'audio/wav',
                'Content-Length': audioBuffer.byteLength.toString(),
              },
            });
          } catch (error) {
            console.error('Error proxying to SherpaOnnx API:', error);
            return NextResponse.json(
              { error: `Failed to synthesize speech with SherpaOnnx: ${error.message}` },
              { status: 500 }
            );
          }
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

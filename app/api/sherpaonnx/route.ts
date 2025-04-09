import { NextRequest, NextResponse } from "next/server";

// Import our server-side only module for SherpaOnnx
// We use dynamic import to ensure this is only loaded on the server
const sherpaOnnx = require('../../../server/sherpaonnx');

// This is a server-side only API route for SherpaOnnx
export async function POST(request: NextRequest) {
  try {
    console.log("SherpaOnnx API: Synthesizing speech");
    const { text, voiceId, options } = await request.json();
    console.log(`SherpaOnnx API: Request - text: "${text}", voiceId: ${voiceId}`);
    console.log(`SherpaOnnx API: Environment - DYLD_LIBRARY_PATH: ${process.env.DYLD_LIBRARY_PATH}`);
    console.log(`SherpaOnnx API: Current directory: ${process.cwd()}`);

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    if (!voiceId) {
      return NextResponse.json(
        { error: "Voice ID is required" },
        { status: 400 }
      );
    }

    // Check if credentials are valid
    try {
      const credentialsValid = await sherpaOnnx.checkCredentials();
      if (!credentialsValid) {
        console.error("SherpaOnnx API: Invalid credentials");
        return NextResponse.json(
          { error: "Invalid credentials for SherpaOnnx TTS engine" },
          { status: 401 }
        );
      }
    } catch (error: any) {
      console.error("SherpaOnnx API: Error checking credentials:", error);
      return NextResponse.json(
        { error: `Error checking SherpaOnnx credentials: ${error?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Synthesize speech
    try {
      console.log("SherpaOnnx API: Calling synthesizeSpeech");
      const audioBuffer = await sherpaOnnx.synthesizeSpeech(text, voiceId, options);

      // Return the audio as a response
      return new NextResponse(audioBuffer, {
        headers: {
          "Content-Type": "audio/wav",
          "Content-Length": audioBuffer.length.toString(),
        },
      });
    } catch (error: any) {
      console.error("Error synthesizing speech with SherpaOnnx:", error);
      return NextResponse.json(
        { error: `Error synthesizing speech: ${error?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in SherpaOnnx API route:", error);
    return NextResponse.json(
      { error: `Internal server error: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Get voices from SherpaOnnx
export async function GET(request: NextRequest) {
  try {
    console.log("SherpaOnnx API: Getting voices");
    console.log(`SherpaOnnx API: Environment - DYLD_LIBRARY_PATH: ${process.env.DYLD_LIBRARY_PATH}`);
    console.log(`SherpaOnnx API: Current directory: ${process.cwd()}`);

    // Check if credentials are valid
    try {
      const credentialsValid = await sherpaOnnx.checkCredentials();
      if (!credentialsValid) {
        console.error("SherpaOnnx API: Invalid credentials");
        return NextResponse.json(
          { error: "Invalid credentials for SherpaOnnx TTS engine" },
          { status: 401 }
        );
      }
    } catch (error: any) {
      console.error("SherpaOnnx API: Error checking credentials:", error);
      return NextResponse.json(
        { error: `Error checking SherpaOnnx credentials: ${error?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Get the voices
    try {
      console.log("SherpaOnnx API: Getting voices list");
      const voices = await sherpaOnnx.getVoices();
      console.log(`SherpaOnnx API: Found ${voices.length} voices`);

      return NextResponse.json(voices);
    } catch (error: any) {
      console.error("Error getting SherpaOnnx voices:", error);
      return NextResponse.json(
        { error: `Error getting voices: ${error?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in SherpaOnnx API route:", error);
    return NextResponse.json(
      { error: `Internal server error: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

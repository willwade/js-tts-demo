import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get the voice ID from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const voiceId = searchParams.get("voiceId");

    if (!voiceId) {
      return NextResponse.json({ error: "Missing voiceId parameter" }, { status: 400 });
    }

    // Make a request to the WebAssembly server to generate the module
    const wasmServerUrl = process.env.WASM_SERVER_URL || "http://localhost:3003";
    
    // Check if the module already exists
    const response = await fetch(`${wasmServerUrl}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ voiceId }),
    });

    if (!response.ok) {
      let errorMessage = `Failed to generate WebAssembly module for voice: ${voiceId}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e: any) {
        // If the response is not JSON, use the status text
        errorMessage = `Failed to generate WebAssembly module: ${response.statusText}`;
      }
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const data = await response.json();
    
    // Return the URLs for the WebAssembly module
    return NextResponse.json({
      wasmUrl: `${wasmServerUrl}${data.wasmUrl}`,
      jsUrl: `${wasmServerUrl}${data.jsUrl}`,
    });
  } catch (error: any) {
    console.error("Error generating WebAssembly module:", error);
    return NextResponse.json(
      { error: `Internal server error: ${error?.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}

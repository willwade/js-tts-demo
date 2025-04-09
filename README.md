# TTS Demo Web Application

This is a web-based demonstration of the `js-tts-wrapper` library, showcasing its capabilities for text-to-speech synthesis across multiple engines.

## Features

- Support for multiple TTS engines:
  - Azure Cognitive Services
  - ElevenLabs
  - Google Cloud TTS
  - OpenAI TTS
  - PlayHT
  - AWS Polly
  - SherpaOnnx (offline TTS)

- User-friendly interface with:
  - Credentials management
  - Voice selection
  - Text-to-speech playback
  - Audio download

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- API keys for the TTS services you want to use

### Installation

1. Install dependencies:
   ```bash
   cd tts-demo
   npm install
   # or
   pnpm install
   ```

2. Create a `.env.local` file with your API keys:
   ```
   # Azure TTS
   MICROSOFT_TOKEN=your_azure_key
   MICROSOFT_REGION=your_azure_region

   # ElevenLabs
   ELEVENLABS_API_KEY=your_elevenlabs_key

   # Google TTS
   GOOGLE_SA_PATH=path_to_google_service_account_json

   # OpenAI
   OPENAI_API_KEY=your_openai_key

   # PlayHT
   PLAYHT_API_KEY=your_playht_key
   PLAYHT_USER_ID=your_playht_user_id

   # AWS Polly
   POLLY_REGION=your_aws_region
   POLLY_AWS_KEY_ID=your_aws_key_id
   POLLY_AWS_ACCESS_KEY=your_aws_secret_key
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Credentials Tab**: Enable/disable TTS engines and configure API keys
2. **Voices Tab**: Browse and select voices from different TTS engines
3. **Playback Tab**: Enter text, generate speech, and play/download audio

## Architecture

- Next.js 14 application with App Router
- React components with Tailwind CSS and shadcn/ui
- Zustand for state management
- Server-side API routes for TTS processing
- Integration with js-tts-wrapper library

## Notes

- This demo is for demonstration purposes only
- API keys are stored in environment variables for security
## SherpaOnnx Setup

SherpaOnnx is a native library that requires specific environment variables to be set correctly based on the operating system:

- On macOS: `DYLD_LIBRARY_PATH`
- On Linux: `LD_LIBRARY_PATH`
- On Windows: `PATH`

The scripts in this project automatically set these environment variables for you when you use the provided npm scripts.

### For DigitalOcean App Platform

If you're deploying to DigitalOcean App Platform, use the following commands:

```bash
# For building
npm run build:do
# or
yarn build:do
# or
pnpm build:do

# For starting the server
npm run start:do
# or
yarn start:do
# or
pnpm start:do
```

Alternatively, you can set the environment variable in the DigitalOcean App Platform dashboard:

1. Go to your app in the DigitalOcean dashboard
2. Navigate to the Settings tab
3. Under "Environment Variables", add:
   - Key: `LD_LIBRARY_PATH`
   - Value: `/workspace/node_modules/sherpa-onnx-linux-x64:$LD_LIBRARY_PATH`

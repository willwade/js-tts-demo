# Deploying to Digital Ocean

This document provides instructions for deploying the JS TTS Demo application to Digital Ocean.

## Deploying to Digital Ocean App Platform (Recommended)

1. **Create a new App**
   - Go to the Digital Ocean App Platform dashboard
   - Click "Create App"
   - Connect your GitHub repository
   - Select the js-tts-demo repository

2. **Configure the App**
   - Select the branch you want to deploy (usually `main`)
   - Set the source directory to `/`
   - Set the build command to `pnpm build:do:with-sherpa`
   - The run command should be automatically set to `pnpm start:do:with-sherpa` from the Procfile
   - Make sure to set the Node.js version to 18.x or later
   - Make sure to select pnpm as the package manager
   - The HTTP port is automatically set to 8080 in the Procfile
   - The health check path should be set to `/` and port to 8080
   - Do not change the HTTP port in the App Platform settings

3. **Deploy the App**
   - Click "Next" and review your settings
   - Click "Create Resources" to deploy the app

4. **Environment Variables**
   - No environment variables are required for basic functionality
   - For Google TTS, you'll need to set `GOOGLE_SA_PATH` to the path of your Google service account key file
   - For Azure TTS, you'll need to set `MICROSOFT_TOKEN` and `MICROSOFT_REGION`
   - For ElevenLabs TTS, you'll need to set `ELEVENLABS_API_KEY`
   - For OpenAI TTS, you'll need to set `OPENAI_API_KEY`
   - For PlayHT TTS, you'll need to set `PLAYHT_API_KEY` and `PLAYHT_USER_ID`
   - For Polly TTS, you'll need to set `POLLY_REGION`, `POLLY_AWS_KEY_ID`, and `POLLY_AWS_ACCESS_KEY`

5. **SherpaOnnx Configuration**
   - The SherpaOnnx server runs alongside the Next.js application
   - It listens on port 3002 (set by the SHERPAONNX_PORT environment variable)
   - The Next.js application communicates with the SherpaOnnx server via HTTP
   - The build script automatically installs platform-specific SherpaOnnx dependencies
   - If the real SherpaOnnx implementation fails to load, it automatically falls back to a mock implementation
   - To force the use of the real SherpaOnnx implementation on DigitalOcean, set the environment variable `FORCE_SHERPAONNX_REAL=true`
   - To force the use of the mock implementation, set the environment variable `USE_SHERPAONNX_MOCK=true`

6. **Troubleshooting**
   - If you encounter build errors, check the build logs for details
   - If you see TypeScript errors, you may need to update the error handling in the code
   - If the SherpaOnnx server is not starting, check the logs for environment variable issues
   - If you see "Cannot use 'import.meta' outside a module" errors, the server will automatically fall back to mock implementation
   - If you see "Could not find sherpa-onnx-node" errors, the build script should install the platform-specific package automatically
   - If SherpaOnnx is using mock implementation when you want the real one, set `FORCE_SHERPAONNX_REAL=true` environment variable
   - If you encounter npm dependency resolution errors (like "Cannot read properties of null (reading 'matches')"), make sure to use pnpm instead of npm
   - If the Next.js application is running on the wrong port, check the Procfile and make sure the PORT environment variable is set to 8080
   - If you see health check errors like "Readiness probe failed: dial tcp 10.244.12.35:8080: connect: connection refused", make sure the health check port is set to 8080 in the App Platform settings
   - If you see 504 Gateway Timeout errors, it might be due to resource limits. Try upgrading your Digital Ocean App Platform plan or reducing resource usage by using the mock implementation for SherpaOnnx

## Deploying to a Digital Ocean Droplet

Alternatively, you can deploy the application to a Digital Ocean droplet.

## Prerequisites

- A Digital Ocean account
- A Digital Ocean droplet running Ubuntu 20.04 or later
- Node.js 18.x or later installed on the droplet
- Git installed on the droplet

## Deployment Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/willwade/js-tts-demo.git
   cd js-tts-demo
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Build the application**

   ```bash
   pnpm run build:do:with-sherpa
   ```

4. **Set up the systemd service**

   Copy the service file to the systemd directory:

   ```bash
   sudo cp scripts/js-tts-demo.service /etc/systemd/system/
   ```

   Reload systemd to recognize the new service:

   ```bash
   sudo systemctl daemon-reload
   ```

   Enable the service to start on boot:

   ```bash
   sudo systemctl enable js-tts-demo
   ```

   Start the service:

   ```bash
   sudo systemctl start js-tts-demo
   ```

   Check the status of the service:

   ```bash
   sudo systemctl status js-tts-demo
   ```

5. **Set up a reverse proxy (optional)**

   If you want to use a domain name and HTTPS, you can set up Nginx as a reverse proxy:

   ```bash
   sudo apt-get update
   sudo apt-get install nginx certbot python3-certbot-nginx
   ```

   Create an Nginx configuration file:

   ```bash
   sudo nano /etc/nginx/sites-available/js-tts-demo
   ```

   Add the following configuration:

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Create a symbolic link to enable the site:

   ```bash
   sudo ln -s /etc/nginx/sites-available/js-tts-demo /etc/nginx/sites-enabled/
   ```

   Test the Nginx configuration:

   ```bash
   sudo nginx -t
   ```

   Restart Nginx:

   ```bash
   sudo systemctl restart nginx
   ```

   Set up HTTPS with Certbot:

   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

## Troubleshooting

If you encounter any issues, check the logs:

```bash
sudo journalctl -u js-tts-demo
```

If the SherpaOnnx server is not working correctly, run the dependency installation script:

```bash
bash scripts/install-sherpa-deps.sh
```

Or manually install the required libraries:

```bash
pnpm add sherpa-onnx-node@^1.11.3 sherpa-onnx-linux-x64@^1.11.3
```

Make sure the models directory exists:

```bash
mkdir -p /root/.js-tts-wrapper/models
```

## Updating the Application

To update the application:

1. Pull the latest changes:

   ```bash
   cd /root/js-tts-demo
   git pull
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Build the application:

   ```bash
   pnpm run build:do:with-sherpa
   ```

4. Restart the service:

   ```bash
   sudo systemctl restart js-tts-demo
   ```

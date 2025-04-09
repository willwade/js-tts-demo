# Deploying to Digital Ocean

This document provides instructions for deploying the JS TTS Demo application to a Digital Ocean droplet.

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
   npm install
   ```

3. **Build the application**

   ```bash
   npm run build:do:with-sherpa
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

If the SherpaOnnx server is not working correctly, check if the required libraries are installed:

```bash
npm install sherpa-onnx-node@^1.11.3 sherpa-onnx-linux-x64@^1.11.3
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
   npm install
   ```

3. Build the application:

   ```bash
   npm run build:do:with-sherpa
   ```

4. Restart the service:

   ```bash
   sudo systemctl restart js-tts-demo
   ```

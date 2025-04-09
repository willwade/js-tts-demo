#!/bin/bash

# This script helps with deploying the application to Digital Ocean

# Build the application
echo "Building the application..."
npm run build:do:with-sherpa

# Copy the service file to the systemd directory
echo "Setting up the systemd service..."
sudo cp scripts/js-tts-demo.service /etc/systemd/system/

# Reload systemd to recognize the new service
echo "Reloading systemd..."
sudo systemctl daemon-reload

# Enable the service to start on boot
echo "Enabling the service..."
sudo systemctl enable js-tts-demo

# Restart the service
echo "Restarting the service..."
sudo systemctl restart js-tts-demo

# Check the status of the service
echo "Checking the service status..."
sudo systemctl status js-tts-demo

echo "Deployment complete!"
echo "You can check the logs with: sudo journalctl -u js-tts-demo"

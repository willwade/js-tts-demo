#!/bin/bash

# This script is specifically for DigitalOcean App Platform on Linux

echo "Setting up SherpaOnnx environment variables for DigitalOcean..."

# Set environment variables for Linux on DigitalOcean
export LD_LIBRARY_PATH="/workspace/node_modules/sherpa-onnx-linux-x64:$LD_LIBRARY_PATH"
echo "Set LD_LIBRARY_PATH=$LD_LIBRARY_PATH"

# Execute the command passed as arguments
echo "Running command: $@"
exec "$@"

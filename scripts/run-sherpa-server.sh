#!/bin/bash

# This script runs the SherpaOnnx server with the correct environment variables

# Detect platform
PLATFORM=$(uname -s)
ARCH=$(uname -m)

echo "Setting up SherpaOnnx environment variables for server..."
echo "Platform: $PLATFORM, Architecture: $ARCH"

# Set environment variables based on platform
if [ "$PLATFORM" = "Darwin" ]; then
  # macOS
  # The sherpa-onnx-node package automatically detects the platform and architecture
  # We just need to set the DYLD_LIBRARY_PATH to the correct location
  SHERPA_DIR="$PWD/node_modules/sherpa-onnx-darwin-$ARCH"

  # For Digital Ocean App Platform, always use the mock implementation to reduce resource usage
  echo "Using mock implementation for SherpaOnnx to reduce resource usage."
  export USE_SHERPAONNX_MOCK=true

  # Set environment variables
  export DYLD_LIBRARY_PATH="$SHERPA_DIR:$DYLD_LIBRARY_PATH"
  echo "Set DYLD_LIBRARY_PATH=$DYLD_LIBRARY_PATH"

  export DYLD_FALLBACK_LIBRARY_PATH="$SHERPA_DIR:$DYLD_FALLBACK_LIBRARY_PATH"
  echo "Set DYLD_FALLBACK_LIBRARY_PATH=$DYLD_FALLBACK_LIBRARY_PATH"

  # Set the SHERPAONNX_PORT environment variable
  export SHERPAONNX_PORT=3002
  echo "Set SHERPAONNX_PORT=$SHERPAONNX_PORT"

  # Run the server
  echo "Starting SherpaOnnx server..."
  node sherpa-server.js
elif [ "$PLATFORM" = "Linux" ]; then
  # Linux
  # The sherpa-onnx-node package automatically detects the platform and architecture
  # We just need to set the LD_LIBRARY_PATH to the correct location
  if [ "$ARCH" = "x86_64" ]; then
    # Use x64 instead of x86_64 for the path
    SHERPA_DIR="$PWD/node_modules/sherpa-onnx-linux-x64"
  else
    SHERPA_DIR="$PWD/node_modules/sherpa-onnx-linux-$ARCH"
  fi

  # For Digital Ocean App Platform, always use the mock implementation to reduce resource usage
  echo "Using mock implementation for SherpaOnnx to reduce resource usage."
  export USE_SHERPAONNX_MOCK=true

  # Set environment variables
  export LD_LIBRARY_PATH="$SHERPA_DIR:$LD_LIBRARY_PATH"
  echo "Set LD_LIBRARY_PATH=$LD_LIBRARY_PATH"

  # Create models directory if it doesn't exist
  # Check if we're in Digital Ocean App Platform
  if [ -d "/workspace" ]; then
    # Digital Ocean App Platform
    MODELS_DIR="/workspace/.js-tts-wrapper/models"
  else
    # Regular Linux environment
    MODELS_DIR="/root/.js-tts-wrapper/models"
  fi

  echo "Using models directory: $MODELS_DIR"

  if [ ! -d "$MODELS_DIR" ]; then
    echo "Creating models directory: $MODELS_DIR"
    mkdir -p "$MODELS_DIR"
  fi

  # Set the SHERPAONNX_MODEL_DIR environment variable
  export SHERPAONNX_MODEL_DIR="$MODELS_DIR"
  echo "Set SHERPAONNX_MODEL_DIR=$SHERPAONNX_MODEL_DIR"

  # Set the SHERPAONNX_PORT environment variable
  export SHERPAONNX_PORT=3002
  echo "Set SHERPAONNX_PORT=$SHERPAONNX_PORT"

  # Run the server
  echo "Starting SherpaOnnx server..."
  node sherpa-server.js
else
  # Windows or other
  echo "Unsupported platform: $PLATFORM"
  exit 1
fi

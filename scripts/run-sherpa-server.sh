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
  SHERPA_DIR="$PWD/node_modules/sherpa-onnx-darwin-$ARCH"

  # Check if the directory exists
  if [ ! -d "$SHERPA_DIR" ]; then
    echo "Warning: $SHERPA_DIR does not exist. SherpaOnnx may not work correctly."
    echo "Try running: pnpm add sherpa-onnx-node@^1.11.3 sherpa-onnx-darwin-$ARCH@^1.11.3"
  else
    echo "Found SherpaOnnx directory: $SHERPA_DIR"
  fi

  # Set environment variables
  export DYLD_LIBRARY_PATH="$SHERPA_DIR:$DYLD_LIBRARY_PATH"
  echo "Set DYLD_LIBRARY_PATH=$DYLD_LIBRARY_PATH"

  export DYLD_FALLBACK_LIBRARY_PATH="$SHERPA_DIR:$DYLD_FALLBACK_LIBRARY_PATH"
  echo "Set DYLD_FALLBACK_LIBRARY_PATH=$DYLD_FALLBACK_LIBRARY_PATH"

  # Run the server
  echo "Starting SherpaOnnx server..."
  node sherpa-server.js
elif [ "$PLATFORM" = "Linux" ]; then
  # Linux
  SHERPA_DIR="$PWD/node_modules/sherpa-onnx-linux-$ARCH"

  # Check if the directory exists
  if [ ! -d "$SHERPA_DIR" ]; then
    echo "Warning: $SHERPA_DIR does not exist. SherpaOnnx may not work correctly."
    echo "Installing sherpa-onnx-node and sherpa-onnx-linux-$ARCH..."
    npm install sherpa-onnx-node@^1.11.3 sherpa-onnx-linux-$ARCH@^1.11.3

    # Check again after installation
    if [ ! -d "$SHERPA_DIR" ]; then
      echo "Error: Failed to install $SHERPA_DIR. SherpaOnnx will not work correctly."
    else
      echo "Successfully installed SherpaOnnx directory: $SHERPA_DIR"
    fi
  else
    echo "Found SherpaOnnx directory: $SHERPA_DIR"
  fi

  # Set environment variables
  export LD_LIBRARY_PATH="$SHERPA_DIR:$LD_LIBRARY_PATH"
  echo "Set LD_LIBRARY_PATH=$LD_LIBRARY_PATH"

  # Create models directory if it doesn't exist
  MODELS_DIR="/root/.js-tts-wrapper/models"
  if [ ! -d "$MODELS_DIR" ]; then
    echo "Creating models directory: $MODELS_DIR"
    mkdir -p "$MODELS_DIR"
  fi

  # Set the SHERPAONNX_MODEL_DIR environment variable
  export SHERPAONNX_MODEL_DIR="$MODELS_DIR"
  echo "Set SHERPAONNX_MODEL_DIR=$SHERPAONNX_MODEL_DIR"

  # Run the server
  echo "Starting SherpaOnnx server..."
  node sherpa-server.js
else
  # Windows or other
  echo "Unsupported platform: $PLATFORM"
  exit 1
fi

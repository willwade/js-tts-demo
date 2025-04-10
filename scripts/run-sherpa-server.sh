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

  # Check if sherpa-onnx-node is installed
  if ! npm list sherpa-onnx-node > /dev/null 2>&1; then
    echo "Warning: sherpa-onnx-node is not installed."
    echo "Using mock implementation for SherpaOnnx."
    export USE_SHERPAONNX_MOCK=true
  else
    echo "Found sherpa-onnx-node package."

    # Check if the directory exists
    if [ ! -d "$SHERPA_DIR" ]; then
      echo "Warning: $SHERPA_DIR does not exist. This is expected if the package is not installed correctly."
      echo "Using mock implementation for SherpaOnnx."
      export USE_SHERPAONNX_MOCK=true
    else
      echo "Found SherpaOnnx directory: $SHERPA_DIR"
      export USE_SHERPAONNX_MOCK=false
    fi
  fi

  # Set environment variables
  export DYLD_LIBRARY_PATH="$SHERPA_DIR:$DYLD_LIBRARY_PATH"
  echo "Set DYLD_LIBRARY_PATH=$DYLD_LIBRARY_PATH"

  export DYLD_FALLBACK_LIBRARY_PATH="$SHERPA_DIR:$DYLD_FALLBACK_LIBRARY_PATH"
  echo "Set DYLD_FALLBACK_LIBRARY_PATH=$DYLD_FALLBACK_LIBRARY_PATH"

  # Set the PORT environment variable
  export PORT=3002
  echo "Set PORT=$PORT"

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

  # Check if sherpa-onnx-node is installed
  if ! npm list sherpa-onnx-node > /dev/null 2>&1; then
    echo "Warning: sherpa-onnx-node is not installed."
    echo "Using mock implementation for SherpaOnnx."
    export USE_SHERPAONNX_MOCK=true
  else
    echo "Found sherpa-onnx-node package."

    # Check if the directory exists
    if [ ! -d "$SHERPA_DIR" ]; then
      echo "Warning: $SHERPA_DIR does not exist. This is expected if the package is not installed correctly."
      echo "Using mock implementation for SherpaOnnx."
      export USE_SHERPAONNX_MOCK=true
    else
      echo "Found SherpaOnnx directory: $SHERPA_DIR"
      export USE_SHERPAONNX_MOCK=false
    fi
  fi

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

  # Set the PORT environment variable
  export PORT=3002
  echo "Set PORT=$PORT"

  # Run the server
  echo "Starting SherpaOnnx server..."
  node sherpa-server.js
else
  # Windows or other
  echo "Unsupported platform: $PLATFORM"
  exit 1
fi

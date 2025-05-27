#!/bin/bash

# Script to install SherpaOnnx platform-specific dependencies for DigitalOcean deployment

set -e

echo "Installing SherpaOnnx platform-specific dependencies..."

# Detect platform
PLATFORM=$(uname -s)
ARCH=$(uname -m)

echo "Platform: $PLATFORM, Architecture: $ARCH"

# Install platform-specific sherpa-onnx package
if [ "$PLATFORM" = "Linux" ]; then
  if [ "$ARCH" = "x86_64" ]; then
    echo "Installing sherpa-onnx-linux-x64..."
    # Try to install the platform-specific package
    if command -v pnpm &> /dev/null; then
      pnpm add -w sherpa-onnx-linux-x64@^1.11.3 || echo "Warning: Failed to install sherpa-onnx-linux-x64 with pnpm"
    elif command -v npm &> /dev/null; then
      npm install sherpa-onnx-linux-x64@^1.11.3 || echo "Warning: Failed to install sherpa-onnx-linux-x64 with npm"
    else
      echo "Error: No package manager found (npm or pnpm)"
      exit 1
    fi
  else
    echo "Warning: Unsupported Linux architecture: $ARCH"
  fi
elif [ "$PLATFORM" = "Darwin" ]; then
  if [ "$ARCH" = "arm64" ]; then
    echo "Installing sherpa-onnx-darwin-arm64..."
    if command -v pnpm &> /dev/null; then
      pnpm add -w sherpa-onnx-darwin-arm64@^1.11.3 || echo "Warning: Failed to install sherpa-onnx-darwin-arm64 with pnpm"
    elif command -v npm &> /dev/null; then
      npm install sherpa-onnx-darwin-arm64@^1.11.3 || echo "Warning: Failed to install sherpa-onnx-darwin-arm64 with npm"
    fi
  elif [ "$ARCH" = "x86_64" ]; then
    echo "Installing sherpa-onnx-darwin-x64..."
    if command -v pnpm &> /dev/null; then
      pnpm add -w sherpa-onnx-darwin-x64@^1.11.3 || echo "Warning: Failed to install sherpa-onnx-darwin-x64 with pnpm"
    elif command -v npm &> /dev/null; then
      npm install sherpa-onnx-darwin-x64@^1.11.3 || echo "Warning: Failed to install sherpa-onnx-darwin-x64 with npm"
    fi
  else
    echo "Warning: Unsupported macOS architecture: $ARCH"
  fi
else
  echo "Warning: Unsupported platform: $PLATFORM"
fi

# Check if the installation was successful
if [ "$PLATFORM" = "Linux" ] && [ "$ARCH" = "x86_64" ]; then
  SHERPA_DIR="./node_modules/sherpa-onnx-linux-x64"
  if [ -d "$SHERPA_DIR" ]; then
    echo "Successfully installed sherpa-onnx-linux-x64"
    echo "Checking for sherpa-onnx.node file..."
    if [ -f "$SHERPA_DIR/sherpa-onnx.node" ]; then
      echo "Found sherpa-onnx.node file at $SHERPA_DIR/sherpa-onnx.node"
    else
      echo "Warning: sherpa-onnx.node file not found in $SHERPA_DIR"
      ls -la "$SHERPA_DIR" || echo "Directory listing failed"
    fi
  else
    echo "Warning: sherpa-onnx-linux-x64 directory not found"
    echo "Setting environment variable to use mock implementation"
    export USE_SHERPAONNX_MOCK=true
  fi
fi

echo "SherpaOnnx dependency installation complete"

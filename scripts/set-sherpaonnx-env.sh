#!/bin/bash

# Detect platform
PLATFORM=$(uname -s)
ARCH=$(uname -m)

echo "Setting up SherpaOnnx environment variables..."
echo "Platform: $PLATFORM, Architecture: $ARCH"

# Set environment variables based on platform
if [ "$PLATFORM" = "Darwin" ]; then
  # macOS
  export DYLD_LIBRARY_PATH="$PWD/node_modules/sherpa-onnx-darwin-$ARCH:$DYLD_LIBRARY_PATH"
  echo "Set DYLD_LIBRARY_PATH=$DYLD_LIBRARY_PATH"
elif [ "$PLATFORM" = "Linux" ]; then
  # Linux
  export LD_LIBRARY_PATH="$PWD/node_modules/sherpa-onnx-linux-$ARCH:$LD_LIBRARY_PATH"
  echo "Set LD_LIBRARY_PATH=$LD_LIBRARY_PATH"
else
  # Windows or other
  echo "Unsupported platform: $PLATFORM"
  exit 1
fi

# Execute the command passed as arguments
echo "Running command: $@"
exec "$@"

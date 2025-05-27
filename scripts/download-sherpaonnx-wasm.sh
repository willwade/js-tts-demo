#!/bin/bash

# Script to download pre-built SherpaOnnx WebAssembly modules
# This script downloads pre-built WebAssembly modules for SherpaOnnx TTS

set -e

# Create output directory
OUTPUT_DIR="wasm-server/public/wasm"
mkdir -p $OUTPUT_DIR

# Download pre-built WebAssembly modules
echo "Downloading pre-built WebAssembly modules..."

# English voice (Amy)
echo "Downloading English voice (Amy)..."
wget -q https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/sherpa-onnx-wasm-simd-v1.9.0-en-tts.tar.bz2
tar xf sherpa-onnx-wasm-simd-v1.9.0-en-tts.tar.bz2

# Copy the files to the output directory
cp -v sherpa-onnx-wasm-simd-v1.9.0-en-tts/* $OUTPUT_DIR/

# Rename the files to include the voice ID
mv $OUTPUT_DIR/tts.js $OUTPUT_DIR/piper_en_US_amy.js
mv $OUTPUT_DIR/tts.wasm $OUTPUT_DIR/piper_en_US_amy.wasm

# Clean up
rm -rf sherpa-onnx-wasm-simd-v1.9.0-en-tts
rm sherpa-onnx-wasm-simd-v1.9.0-en-tts.tar.bz2

echo "Download complete!"
echo "WebAssembly files are available in $OUTPUT_DIR/"

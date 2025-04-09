#!/usr/bin/env node

// Force output to be visible
process.stdout.write('Starting SherpaOnnx setup script...\n');

const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

// Determine the platform and architecture
const platform = os.platform();
const arch = os.arch();
const platformName = platform === 'win32' ? 'win' : platform;
const platformArch = `${platformName}-${arch}`;

console.log(`\nSherpaOnnx Setup`);
console.log(`=================`);
console.log(`Detected platform: ${platform}, architecture: ${arch}`);
console.log(`Checking for sherpa-onnx-${platformArch} package...`);

// Check if the package is already installed
const packagePath = path.join(process.cwd(), 'node_modules', `sherpa-onnx-${platformArch}`);
if (fs.existsSync(packagePath)) {
  console.log(`Package sherpa-onnx-${platformArch} is already installed.`);
  process.exit(0);
}

// Instead of trying to install the package, just print instructions
console.log(`\nThe package sherpa-onnx-${platformArch} is not installed.`);
console.log('This is expected and will be handled by the run-with-sherpaonnx.js script.');
console.log('\nWhen running the application, make sure to use the provided scripts:');
console.log('  npm run dev    - for development');
console.log('  npm run build  - for building');
console.log('  npm run start  - for production');
console.log('\nThese scripts will automatically set the correct environment variables.');

// Print environment variable instructions for manual setup
console.log('\nIf you need to run commands manually, set the appropriate environment variable:');

if (platform === 'darwin') {
  console.log(`export DYLD_LIBRARY_PATH=${process.cwd()}/node_modules/sherpa-onnx-darwin-${arch}:$DYLD_LIBRARY_PATH`);
} else if (platform === 'linux') {
  console.log(`export LD_LIBRARY_PATH=${process.cwd()}/node_modules/sherpa-onnx-linux-${arch}:$LD_LIBRARY_PATH`);
} else if (platform === 'win32') {
  console.log(`set PATH=%PATH%;${process.cwd()}\\node_modules\\sherpa-onnx-win-${arch}`);
}

// For DigitalOcean App Platform, the path is different
if (platform === 'linux') {
  console.log('\nFor DigitalOcean App Platform, use:');
  console.log('export LD_LIBRARY_PATH=/workspace/node_modules/sherpa-onnx-linux-x64:$LD_LIBRARY_PATH');
}

// Exit successfully
process.exit(0);

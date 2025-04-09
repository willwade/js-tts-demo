#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const os = require('os');

console.log('SherpaOnnx Environment Check');
console.log('===========================');
console.log(`Platform: ${os.platform()}`);
console.log(`Architecture: ${os.arch()}`);
console.log(`Node.js Version: ${process.version}`);
console.log(`Current Working Directory: ${process.cwd()}`);

// Check environment variables
if (os.platform() === 'darwin') {
  console.log(`DYLD_LIBRARY_PATH: ${process.env.DYLD_LIBRARY_PATH || 'not set'}`);
} else if (os.platform() === 'linux') {
  console.log(`LD_LIBRARY_PATH: ${process.env.LD_LIBRARY_PATH || 'not set'}`);
} else if (os.platform() === 'win32') {
  console.log(`PATH: ${process.env.PATH || 'not set'}`);
}

// Check for SherpaOnnx libraries
const platform = os.platform();
const arch = os.arch();
const platformName = platform === 'win32' ? 'win' : platform;
const platformArch = `${platformName}-${arch}`;

// Try different possible paths
const possiblePaths = [
  path.join(process.cwd(), 'node_modules', `sherpa-onnx-${platformArch}`),
  path.join(process.cwd(), 'node_modules', '.pnpm', `sherpa-onnx-node@*`, 'node_modules', `sherpa-onnx-${platformArch}`),
  path.join(process.cwd(), 'node_modules', 'sherpa-onnx-node', 'node_modules', `sherpa-onnx-${platformArch}`)
];

console.log('\nPossible SherpaOnnx library paths:');
possiblePaths.forEach(p => console.log(`- ${p}`));

// Find the first path that exists
let libraryPath = possiblePaths.find(p => fs.existsSync(p));
if (!libraryPath) {
  libraryPath = possiblePaths[0]; // Default to first path if none exist
}

console.log(`\nChecking for SherpaOnnx library at: ${libraryPath}`);

if (fs.existsSync(libraryPath)) {
  console.log('✅ SherpaOnnx library directory exists');

  // Check for the .node file
  const nodeFile = path.join(libraryPath, 'sherpa-onnx.node');
  if (fs.existsSync(nodeFile)) {
    console.log(`✅ Found sherpa-onnx.node file: ${nodeFile}`);
  } else {
    console.log(`❌ sherpa-onnx.node file not found at: ${nodeFile}`);
  }

  // List all files in the directory
  console.log('\nFiles in the SherpaOnnx library directory:');
  try {
    const files = fs.readdirSync(libraryPath);
    files.forEach(file => {
      console.log(`- ${file}`);
    });
  } catch (err) {
    console.error(`Error reading directory: ${err.message}`);
  }
} else {
  console.log('❌ SherpaOnnx library directory does not exist');
}

// Check node_modules structure
console.log('\nChecking node_modules structure:');
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ node_modules directory exists');

  // Look for sherpa-onnx related packages
  const sherpaPackages = fs.readdirSync(nodeModulesPath)
    .filter(dir => dir.startsWith('sherpa-onnx'));

  if (sherpaPackages.length > 0) {
    console.log('Found SherpaOnnx related packages:');
    sherpaPackages.forEach(pkg => {
      console.log(`- ${pkg}`);
    });
  } else {
    console.log('❌ No SherpaOnnx related packages found in node_modules');
  }
} else {
  console.log('❌ node_modules directory does not exist');
}

console.log('\nEnvironment check complete');

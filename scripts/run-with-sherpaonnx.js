const path = require('path');
const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');

function getSherpaOnnxPath() {
  const platform = os.platform();
  const arch = os.arch();
  const cwd = process.cwd();

  // Match the platform naming convention used in addon.js
  const platformName = platform === 'win32' ? 'win' : platform;
  const platformArch = `${platformName}-${arch}`;

  // First check if the package exists in the node_modules directory
  const directPath = path.join(cwd, 'node_modules', `sherpa-onnx-${platformArch}`);
  if (fs.existsSync(directPath)) {
    return directPath;
  }

  // Check in pnpm structure
  const pnpmPath = findInPnpmNodeModules(cwd, platformArch);
  if (pnpmPath) {
    return pnpmPath;
  }

  // Fallback to the standard path
  return path.join(cwd, 'node_modules', `sherpa-onnx-${platformArch}`);
}

function findInPnpmNodeModules(cwd, platformArch) {
  const nodeModulesPath = path.join(cwd, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    return null;
  }

  // Check for .pnpm directory
  const pnpmPath = path.join(nodeModulesPath, '.pnpm');
  if (!fs.existsSync(pnpmPath)) {
    return null;
  }

  // Try to find the sherpa-onnx package
  try {
    const dirs = fs.readdirSync(pnpmPath);
    for (const dir of dirs) {
      if (dir.startsWith('sherpa-onnx-')) {
        const packagePath = path.join(pnpmPath, dir, 'node_modules', `sherpa-onnx-${platformArch}`);
        if (fs.existsSync(packagePath)) {
          return packagePath;
        }
      }
    }
  } catch (error) {
    console.error('Error searching for sherpa-onnx in pnpm directory:', error);
  }

  return null;
}

function setLibraryPath() {
  const platform = os.platform();
  const sherpaPath = getSherpaOnnxPath();

  switch (platform) {
    case 'darwin':
      process.env.DYLD_LIBRARY_PATH = `${sherpaPath}:${process.env.DYLD_LIBRARY_PATH || ''}`;
      break;
    case 'linux':
      process.env.LD_LIBRARY_PATH = `${sherpaPath}:${process.env.LD_LIBRARY_PATH || ''}`;
      break;
    case 'win32':
      process.env.PATH = `${sherpaPath};${process.env.PATH || ''}`;
      break;
  }
}

// Set the library path
setLibraryPath();

// Debug information
const platform = os.platform();
const sherpaPath = getSherpaOnnxPath();
console.log(`Platform: ${platform}`);
console.log(`Architecture: ${os.arch()}`);
console.log(`SherpaOnnx Path: ${sherpaPath}`);

if (platform === 'darwin') {
  console.log(`DYLD_LIBRARY_PATH: ${process.env.DYLD_LIBRARY_PATH}`);
} else if (platform === 'linux') {
  console.log(`LD_LIBRARY_PATH: ${process.env.LD_LIBRARY_PATH}`);
} else if (platform === 'win32') {
  console.log(`PATH: ${process.env.PATH}`);
}

// Run the actual command
const [,, ...args] = process.argv;
console.log(`Running command: npx ${args.join(' ')}`);

const child = spawn('npx', args, {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

child.on('exit', (code) => {
  process.exit(code);
});
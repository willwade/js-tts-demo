const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

function getSherpaOnnxPath() {
  const platform = os.platform();
  const arch = os.arch();
  
  let libraryPath = path.join(process.cwd(), 'node_modules', 'sherpa-onnx-node');
  
  switch (platform) {
    case 'darwin':
      return path.join(libraryPath, `sherpa-onnx-darwin-${arch}`);
    case 'linux':
      return path.join(libraryPath, `sherpa-onnx-linux-${arch}`);
    case 'win32':
      return path.join(libraryPath, `sherpa-onnx-win32-${arch}`);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
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

// Run the actual command
const [,, ...args] = process.argv;
const child = spawn('npx', args, { 
  stdio: 'inherit',
  shell: true,
  env: process.env
});

child.on('exit', (code) => {
  process.exit(code);
});
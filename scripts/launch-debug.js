#!/usr/bin/env node

/**
 * Cross-platform debug app launcher
 *
 * This script launches the debug-built Tauri app on any platform:
 * - Windows: colorpicker.exe
 * - macOS: colorpicker.app (or binary)
 * - Linux: colorpicker
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const platform = process.platform;
const arch = process.arch;

console.log(`Platform: ${platform}`);
console.log(`Architecture: ${arch}`);

// Determine the path to the debug executable
let executablePath;
let executableArgs = [];

if (platform === 'win32') {
  // Windows
  executablePath = join(__dirname, '..', 'src-tauri', 'target', 'debug', 'colorpicker.exe');
} else if (platform === 'darwin') {
  // macOS - prefer the .app bundle
  const appBundlePath = join(__dirname, '..', 'src-tauri', 'target', 'debug', 'bundle', 'macos', 'colorpicker.app');
  const binaryPath = join(__dirname, '..', 'src-tauri', 'target', 'debug', 'colorpicker');

  if (existsSync(appBundlePath)) {
    // Use 'open' command to launch the .app bundle
    executablePath = 'open';
    executableArgs = [appBundlePath];
    console.log('Launching macOS app bundle...');
  } else if (existsSync(binaryPath)) {
    // Fallback to direct binary
    executablePath = binaryPath;
    console.log('Launching macOS binary directly...');
  } else {
    console.error('Error: Could not find macOS app bundle or binary');
    console.error('Expected locations:');
    console.error(`  - ${appBundlePath}`);
    console.error(`  - ${binaryPath}`);
    process.exit(1);
  }
} else {
  // Linux
  executablePath = join(__dirname, '..', 'src-tauri', 'target', 'debug', 'colorpicker');
}

// Check if executable exists
if (!existsSync(executablePath) && platform !== 'darwin') {
  console.error(`Error: Executable not found at: ${executablePath}`);
  console.error('\nMake sure you have built the app first:');
  console.error('  npm run tauri:build:debug');
  process.exit(1);
}

console.log(`Launching: ${executablePath} ${executableArgs.join(' ')}`);
console.log('---');

// Launch the app
const child = spawn(executablePath, executableArgs, {
  stdio: 'inherit',
  shell: false,
});

// Handle process exit
child.on('error', (error) => {
  console.error(`Failed to launch app: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code !== null && code !== 0) {
    console.error(`App exited with code: ${code}`);
    process.exit(code);
  }
  process.exit(0);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});

import path from 'node:path'
import { defineConfig } from 'vitest/config'

// Minimal vitest config, separate from vite.config.ts (which is Tauri-dev/build
// specific). Only unit-testing pure TS logic for now — no DOM/component testing
// setup (jsdom etc.) until something actually needs it.
export default defineConfig({
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@common': path.resolve(__dirname, 'src/common'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@stores': path.resolve(__dirname, 'src/stores'),
      '@interfaces': path.resolve(__dirname, 'src/types'),
      '@windows': path.resolve(__dirname, 'src/windows'),
    },
  },
  test: {
    environment: 'node',
  },
})

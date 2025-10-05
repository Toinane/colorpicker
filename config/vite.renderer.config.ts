import path from 'node:path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@electron': path.resolve(__dirname, '../src/electron'),
      '@interfaces': path.resolve(__dirname, '../src/types'),
      '@components': path.resolve(__dirname, '../src/react/components'),
      '@windows': path.resolve(__dirname, '../src/react/windows'),
      '@common': path.resolve(__dirname, '../src/common'),
    },
  },
})

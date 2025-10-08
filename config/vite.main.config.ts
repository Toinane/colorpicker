import path from 'node:path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      '@electron': path.resolve(__dirname, '../src/electron'),
      '@interfaces': path.resolve(__dirname, '../src/types'),
      '@react': path.resolve(__dirname, '../src/react'),
      '@common': path.resolve(__dirname, '../src/common'),
      '@assets': path.resolve(__dirname, '../src/assets'),
    },
  },
  plugins: [
    {
      name: 'electron:hot-reload',
      closeBundle() {
        process.stdin.emit('data', 'rs')
      },
    },
  ],
})

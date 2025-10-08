import path from 'node:path'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config
export default defineConfig({
  plugins: [svgr()],
  resolve: {
    alias: {
      '@interfaces': path.resolve(__dirname, '../src/types'),
      '@react': path.resolve(__dirname, '../src/react'),
      '@components': path.resolve(__dirname, '../src/react/components'),
      '@windows': path.resolve(__dirname, '../src/react/windows'),
      '@common': path.resolve(__dirname, '../src/common'),
      '@assets': path.resolve(__dirname, '../src/assets'),
    },
  },
})

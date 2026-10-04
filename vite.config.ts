import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => ({
  // Relative base so the built app works from any folder or static host.
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    // `npm run build:single` inlines everything into one shareable HTML file.
    ...(mode === 'single' ? [viteSingleFile()] : []),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    outDir: mode === 'single' ? 'dist-single' : 'dist',
    chunkSizeWarningLimit: 1200,
  },
}))

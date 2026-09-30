import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build` → dist/ (sitio normal)
// `npm run build:single` → dist-single/index.html (un solo archivo, útil para compartir o abrir sin servidor)
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  build: { chunkSizeWarningLimit: 900, ...(mode === 'single' ? { outDir: 'dist-single', emptyOutDir: true } : {}) },
}))

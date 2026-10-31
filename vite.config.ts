import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('pdf-lib')) return 'pdf-engine';
          if (id.includes('exifreader') || id.includes('piexifjs')) return 'exif-engine';
          if (id.includes('mp3tag.js')) return 'audio-engine';
          if (id.includes('jszip')) return 'zip-engine';
          if (id.includes('node_modules/react') || id.includes('node_modules/lucide-react')) return 'ui-vendor';
        }
      }
    },
    chunkSizeWarningLimit: 800
  }
});

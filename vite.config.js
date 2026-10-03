import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('chart.js') || id.includes('vue-chartjs')) {
              return 'vendor-charts';
            }
            if (id.includes('exceljs') || id.includes('file-saver')) {
              return 'vendor-excel';
            }
            if (id.includes('sweetalert2')) {
              return 'vendor-swal';
            }
            if (id.includes('bootstrap')) {
              return 'vendor-bootstrap';
            }
            if (id.includes('vue') || id.includes('pinia') || id.includes('axios')) {
              return 'vendor-core';
            }
          }
        }
      }
    }
  }
})

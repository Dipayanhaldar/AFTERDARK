import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
    hmr: false,
    watch: {
      ignored: ['**/.data/**', '**/android/**', '**/guest-site/**', '**/dist/**', '**/store-output/**']
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(process.cwd(), 'index.html'),
        guest: path.resolve(process.cwd(), 'guest.html')
      }
    }
  }
});

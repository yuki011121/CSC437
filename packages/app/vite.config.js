// packages/app/vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';


export default defineConfig({
  // base: '/app/',

  server: {
    proxy: {
      '/api' : 'http://localhost:3000',
      '/auth': 'http://localhost:3000'
    }
  },
  build: {
    rollupOptions: {
      input: {
        main : resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        signup: resolve(__dirname, 'signup.html') 
      }
    }
    // outDir: 'dist',
    // emptyOutDir: true
  }
});
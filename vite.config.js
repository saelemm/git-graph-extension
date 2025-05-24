import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        content: 'src/content.js'
      },
      output: {
        entryFileNames: 'content.js'
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2015'
  }
});

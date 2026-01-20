import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import {
  copyFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  statSync,
  renameSync,
  rmSync,
} from 'fs';

// Plugin to finalize Chrome extension structure
function chromeExtensionPlugin() {
  return {
    name: 'chrome-extension',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist');
      const publicDir = resolve(__dirname, 'public');

      // Copy public files
      function copyDir(src: string, dest: string) {
        if (!existsSync(dest)) {
          mkdirSync(dest, { recursive: true });
        }
        const entries = readdirSync(src);
        for (const entry of entries) {
          const srcPath = resolve(src, entry);
          const destPath = resolve(dest, entry);
          if (statSync(srcPath).isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            copyFileSync(srcPath, destPath);
          }
        }
      }

      copyDir(publicDir, distDir);

      // Move newtab HTML from src/newtab to newtab
      const srcNewtabDir = resolve(distDir, 'src/newtab');
      const newtabDir = resolve(distDir, 'newtab');

      if (existsSync(srcNewtabDir)) {
        if (!existsSync(newtabDir)) {
          mkdirSync(newtabDir, { recursive: true });
        }
        // Move index.html
        if (existsSync(resolve(srcNewtabDir, 'index.html'))) {
          renameSync(
            resolve(srcNewtabDir, 'index.html'),
            resolve(newtabDir, 'index.html')
          );
        }
        // Clean up src folder
        rmSync(resolve(distDir, 'src'), { recursive: true, force: true });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), chromeExtensionPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        newtab: resolve(__dirname, 'src/newtab/index.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background/index.js';
          }
          return 'newtab/[name].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});

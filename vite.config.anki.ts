import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import path from 'path';
import fs from 'fs';

// A simple plugin to delete files not required for anki
const cleanupDistPlugin = () => {
  return {
    name: 'cleanup-dist',
    closeBundle: () => {
      const distPath = resolve(__dirname, 'dist-anki');
      const filesToDelete = ['index.html', 'favicon.ico'];

      filesToDelete.forEach((file) => {
        const filePath = resolve(distPath, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted ${file}`);
        }
      });
    },
  };
};

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
const versionedName = `_ankiChess${pkg.version}`;

export default defineConfig({
  plugins: [svelte(), cleanupDistPlugin()],
  // anki requires relative paths (./) because files are served locally
  base: './',
  minify: true,
  resolve: {
    alias: {
      $components: path.resolve('./src/components'),
      $stores: path.resolve('./src/stores'),
      $scss: path.resolve('./src/scss'),
      $assets: path.resolve('./src/assets'),
      $utils: path.resolve('./src/utils'),
      $features: path.resolve('./src/utils/features'),
      $anki: path.resolve('./src/anki_templates'),
    },
    extensions: ['.mjs', '.js', '.ts', '.svelte.ts', '.svelte', '.json'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "$scss/_globals.scss" as *;`,
      },
    },
  },
  build: {
    // specific output folder for this build
    outDir: 'dist-anki/collection.media',
    emptyOutDir: true,
    // Flatten the assets (do not put them in an /assets folder)
    assetsDir: '',
    rollupOptions: {
      output: {
        // Force the main JS file name
        entryFileNames: `${versionedName}.js`,
        // Force chunk names (if code splitting happens) to start with _
        chunkFileNames: `${versionedName}-[name].js`,
        // Force asset names (images, css, wasm, etc.) to start with _
        assetFileNames: (assetInfo) => {
          // If it's the main CSS file generated from the entry, name it specifically
          if (assetInfo.names.some((n) => n.endsWith('.css'))) {
            return `${versionedName}.css`;
          }
          if (assetInfo.names.some((n) => n.endsWith('.woff2'))) {
            return '_[name][extname]';
          }
          if (assetInfo.names.some((n) => !n.startsWith('_'))) {
            return '_[name][extname]';
          }
          // All other assets (images, fonts) get the prefix
          return '[name][extname]';
        },
      },
    },
  },
});

import { defineConfig } from 'vite';
import { sharedViteConfig } from './shared-vite-config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import Icons from 'unplugin-icons/vite';
import fs from 'fs';
import archiver from 'archiver';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
const versionedName = `_ankiChess${pkg.version}`;

// A simple plugin to delete files not required for anki
const cleanupDistPlugin = () => {
  return {
    name: 'cleanup-dist',
    closeBundle: () => {
      const distPath = resolve(__dirname, 'dist-anki/collection.media');
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

const zipReleasePlugin = () => {
  return {
    name: 'zip-release',
    closeBundle: () => {
      return new Promise<void>((resolvePromise, rejectPromise) => {
        const distPath = resolve(__dirname, 'dist-anki/collection.media');
        const outputZipPath = resolve(__dirname, 'dist-anki/anki-chess-release.zip');
        const templatesPath = resolve(__dirname, 'src/anki_templates');

        console.log(`\n📦 Zipping release to: ${outputZipPath}...`);

        const output = fs.createWriteStream(outputZipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
          console.log(`✅ Release zip created! (${archive.pointer()} total bytes)`);
          resolvePromise();
        });

        archive.on('error', (err) => {
          console.error('Zip Error:', err);
          rejectPromise(err);
        });

        archive.pipe(output);

        // Add all built media files (JS, CSS, Assets) from dist
        // We filter to ensure we don't accidentally zip the folder itself or hidden files
        archive.directory(distPath, false, (entry) => {
             // Extra safety to ensure we only include files starting with _
             return entry;
        });

        // Add the Templates manually (Renaming them to what Python expects)
        // Python looks for "front.html" and "style.css" specifically.
        archive.file(resolve(templatesPath, 'front.html'), { name: 'front.html' });
        archive.file(resolve(templatesPath, 'style.css'), { name: 'style.css' });

        archive.finalize();
      });
    },
  };
};

export default defineConfig(sharedViteConfig({
  plugins: [
    svelte(),
    cleanupDistPlugin(),
    Icons({
      compiler: 'svelte',
      autoInstall: true,
    }),
    zipReleasePlugin()
  ],
  // anki requires relative paths (./) because files are served locally
  base: './',
  build: {
    // specific output folder for this build
    outDir: 'dist-anki/collection.media',
    emptyOutDir: true,
    assetsInlineLimit: 20480,
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
}));

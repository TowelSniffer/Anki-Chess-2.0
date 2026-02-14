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
        const configPath = resolve(__dirname, 'src/anki/default_config.json');

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

        //  Add compiled media files (Svelte JS/CSS)
        // These will be versioned (e.g. _ankiChess1.0.0.css)
        archive.directory(distPath, false);

        //  Process Templates (Front.html & style.css)
        ['front.html', 'style.css'].forEach(filename => {
            const srcPath = resolve(templatesPath, filename);
            let content = fs.readFileSync(srcPath, 'utf-8');

            //  Replace __VERSION__ placeholder (Used in front.html)
            content = content.replaceAll('__VERSION__', version);

            //  Inject Default Config (Only for front.html)
            if (filename === 'front.html') {
                const defaultConfig = fs.readFileSync(configPath, 'utf-8');
                // Create the JS assignment string
                const configInjection = `window.USER_CONFIG = ${defaultConfig};`;
                content = content.replace('// __USER_CONFIG__', configInjection);
            }

            //  Add to zip
            // "style.css" remains "style.css"
            // "front.html" becomes "Front.html" (Capitalized for Python script)
            const zipName = filename === 'front.html' ? 'Front.html' : filename;

            archive.append(content, { name: zipName });
            console.log(`   Formatted and added ${zipName}`);
        });

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

import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import eslint from 'vite-plugin-eslint2';
import path from 'path';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
  plugins: [
    svelte(),
    eslint({
      overrideConfigFile: './.eslintrc.cjs',
      cache: false,
    }),
    Icons({
      compiler: 'svelte',
      autoInstall: true,
    }),
  ],
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
});

import { defineConfig } from 'vite';
import { sharedViteConfig } from './shared-vite-config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import eslint from 'vite-plugin-eslint2';
import Icons from 'unplugin-icons/vite';

export default defineConfig(sharedViteConfig({
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
  ]
}));

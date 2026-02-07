// shared-vite-config.ts
import { defineConfig, type UserConfig } from 'vite';
import path from 'path';

export const sharedViteConfig = (options: UserConfig = {}): UserConfig => {
  return {
    resolve: {
      alias: {
        $components: path.resolve(__dirname, './src/components'),
        $stores: path.resolve(__dirname, './src/stores'),
        $scss: path.resolve(__dirname, './src/scss'),
        $assets: path.resolve(__dirname, './src/assets'),
        $utils: path.resolve(__dirname, './src/utils'),
        $features: path.resolve(__dirname, './src/utils/features'),
        $anki: path.resolve(__dirname, './src/anki_templates'),
        $Types: path.resolve(__dirname, './src/Types'),
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
    ...options, // Merge any specific options passed in
  };
};

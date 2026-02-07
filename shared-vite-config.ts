// shared-vite-config.ts
import { defineConfig, UserConfig } from 'vite';
import path from 'path';

export const sharedViteConfig = (options: UserConfig = {}): UserConfig => {
  return {
    resolve: {
      alias: {
        $components: path.resolve('./src/components'),
        $stores: path.resolve('./src/stores'),
        $scss: path.resolve('./src/scss'),
        $assets: path.resolve('./src/assets'),
        $utils: path.resolve('./src/utils'),
        $features: path.resolve('./src/utils/features'),
        $anki: path.resolve('./src/anki_templates'),
        $Types: path.resolve('./src/Types'),
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

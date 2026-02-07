module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parser: 'svelte-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: '@typescript-eslint/parser',
    extraFileExtensions: ['.svelte', '.svelte.ts', '.svelte.js'],
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:svelte/recommended',
    'prettier'
  ],
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
      plugins: ['svelte'],
      rules: {
        'svelte/no-at-html-tags': 'error',
        'svelte/no-dupe-else-if': 'error',
      },
    },
  ],
  plugins: ['@typescript-eslint', 'import'],
};

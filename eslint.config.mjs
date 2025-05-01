import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ...js.configs.recommended,
    files: ['**/*.{js,ts,cjs,mjs}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'warn',
    },
    ignores: ['node_modules'],
  },
]);

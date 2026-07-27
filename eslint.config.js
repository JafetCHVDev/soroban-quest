import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    // Global ignore rules
    ignores: [
      'dist',
      'node_modules',
      'playwright-report',
      'vite.config.ts',
      'playwright.config.js',
    ],
  },
  js.configs.recommended,
  {
    // Target both .js, .ts, and .tsx files inside src
    files: ['src/**/*.{js,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tsParser,
      globals: {
        ...globals.browser, // Defines window, document, localStorage, custom events, etc.
        ...globals.node, // Defines process, require, etc.
        ...globals.jest, // Defines test environments
      },
    },
    plugins: {
      '@typescript-eslint': ts,
      react: react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...ts.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',

      // Custom unused variables setup for both TS and baseline JS files
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      'no-console': 'off',
      ...prettier.rules,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];

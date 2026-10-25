import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'

const productionFiles = [
  'pages/index.page.tsx',
  'pages/api/affordability.page.ts',
  'pages/api/calculate.page.ts',
  'pages/api/health.page.ts',
  'pages/api/healthz.page.ts',
  'pages/api/v2/**/*.page.ts',
  'lib/server/**/*.ts',
  'middleware.ts',
]

export default [
  {
    files: productionFiles,
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      'no-debugger': 'error',
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
]

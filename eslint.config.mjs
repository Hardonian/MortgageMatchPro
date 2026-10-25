import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'

const productionFiles = [
  'pages/**/*.page.ts',
  'pages/**/*.page.tsx',
  'components/site/**/*.ts',
  'components/site/**/*.tsx',
  'lib/server/**/*.ts',
  'proxy.ts',
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

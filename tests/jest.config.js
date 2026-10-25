const path = require('path');

module.exports = {
  rootDir: path.resolve(__dirname, '..'),
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.test.tsx'
  ],
  testPathIgnorePatterns: ['/node_modules/', '/tests/e2e/', '/tests/unit/e2e/'],
  collectCoverageFrom: [
    'core/**/*.{ts,tsx}',
    'shared/**/*.{ts,tsx}',
    'apps/web/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@core/(.*)$': '<rootDir>/core/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@docs/(.*)$': '<rootDir>/docs/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@components/(.*)$': '<rootDir>/shared/components/$1',
    '^@utils/(.*)$': '<rootDir>/shared/utils/$1',
    '^@types/(.*)$': '<rootDir>/shared/types/$1',
    '^@services/(.*)$': '<rootDir>/core/$1',
    '^@hooks/(.*)$': '<rootDir>/shared/hooks/$1',
    '^@constants/(.*)$': '<rootDir>/shared/constants/$1'
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  testTimeout: 10000,
  verbose: true
};
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.test.tsx',
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx'
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'core/**/*.{ts,tsx}',
    'shared/**/*.{ts,tsx}',
    'apps/web/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
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
  }
};

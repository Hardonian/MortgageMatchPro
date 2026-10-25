module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/production/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.production.json' }],
  },
  collectCoverageFrom: [
    'pages/api/*.page.ts',
    'lib/server/**/*.ts',
    '!**/*.d.ts',
  ],
}

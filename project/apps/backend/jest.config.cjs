/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/tests/jest-setup.ts'],
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@shared/db$': '<rootDir>/../../shared/db/src/index.ts',
    '^@features$': '<rootDir>/src/features/index.ts',
    '^@types$': '<rootDir>/src/common/types/index.ts',
    '^@utils$': '<rootDir>/src/common/utils/index.ts',
    '^@plugins$': '<rootDir>/src/plugins/index.ts',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: '<rootDir>/tsconfig.test.json',
      },
    ],
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
}

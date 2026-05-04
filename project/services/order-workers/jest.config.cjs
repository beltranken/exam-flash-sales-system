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
    '^@db$': '<rootDir>/src/db.ts',
    '^@cache$': '<rootDir>/src/cache.ts',
    '^@logger$': '<rootDir>/src/logger.ts',
    '^@handlers/(.*)$': '<rootDir>/src/handlers/$1',
    '^@shared/cache-contracts$': '<rootDir>/src/tests/shared-cache-contracts.mock.ts',
    '^@shared/db$': '<rootDir>/../../shared/db/src/index.ts',
    '^@shared/order-contracts$': '<rootDir>/../../shared/order-contracts/src/index.ts',
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
}

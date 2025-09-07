// backend/jest.config.mjs
export default {
  testEnvironment: 'node',
  // You have "__test__" (single) — include both patterns just in case
  testMatch: ['**/src/__test__/**/*.test.js', '**/src/__tests__/**/*.test.js'],
  globalSetup: '<rootDir>/src/test/globalSetup.js',
  globalTeardown: '<rootDir>/src/test/globalTeardown.js',
  setupFilesAfterEnv: ['<rootDir>/src/test/setupFileAfterEnv.js'],
  // No transform needed for pure Node ESM
};

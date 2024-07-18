const sharedConfig = require('../jest.config');

/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  ...sharedConfig,
  rootDir: "../",
  testMatch: [
    '<rootDir>**/src/**/*.int-spec.(ts)'
  ],
  globalSetup: "<rootDir>/jest/int-global-setup.ts",
  globalTeardown: "<rootDir>/jest/int-global-teardown.ts",
};
  
const sharedConfig = require("../../jest.config");

/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  ...sharedConfig,
  rootDir: "../",
  testMatch: ["<rootDir>**/src/**/*.e2e-spec.(ts)"],
  globalSetup: "<rootDir>/jest/e2e/e2e-global-setup.ts",
  globalTeardown: "<rootDir>/jest/e2e/e2e-global-teardown.ts",
};

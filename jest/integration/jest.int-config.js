const sharedConfig = require("../../jest.config");

/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  ...sharedConfig,
  rootDir: "../..",
  testMatch: ["<rootDir>**/src/**/*.integration.(ts)"],
  globalSetup: "<rootDir>/jest/integration/int-global-setup.ts",
  globalTeardown: "<rootDir>/jest/integration/int-global-teardown.ts",
};

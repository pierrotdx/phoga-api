

const sharedConfig = require("../../jest.config");

/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  ...sharedConfig,
  rootDir: "../..",
  testMatch: ["<rootDir>**/src/**/*.integration.(ts)"],
  globalSetup: "<rootDir>/jest/integration/integration-global-setup.ts",
  globalTeardown: "<rootDir>/jest/integration/integration-global-teardown.ts",
};

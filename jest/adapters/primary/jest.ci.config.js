const sharedConfig = require("../../../jest.config");

/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  ...sharedConfig,
  rootDir: "../../..",
  testMatch: [
    "<rootDir>**/src/**/*.spec.(ts)",
    "<rootDir>**/src/**/*.integration.(ts)",
    "<rootDir>**/src/**/*.e2e-spec.(ts)",
  ],
  collectCoverage: true,
  setupFilesAfterEnv: ['dotenv/config']
};

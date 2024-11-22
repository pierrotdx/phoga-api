/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  rootDir: "./",
  testMatch: [
    "<rootDir>**/src/**/*.spec.(ts)",
    "<rootDir>**/src/**/*.integration.(ts)",
    "<rootDir>**/src/**/*.e2e-spec.(ts)",
  ],
  moduleNameMapper: {
    "@assertions-counter": "<rootDir>/src/shared/assertions-counter",
    "@dumb-photo-generator": "<rootDir>/src/shared/dumb-photo-generator",
    "@domain": "<rootDir>/src/domain",
    "@http-server": "<rootDir>/src/http-server",
    "@http-server/*": "<rootDir>/src/http-server/*",
    "@logger": "<rootDir>/src/logger/",
    "@logger/*": "<rootDir>/src/logger/*",
    "@shared": "<rootDir>/src/shared",
    "@shared/*": "<rootDir>/src/shared/*",
  },
};

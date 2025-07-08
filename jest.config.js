/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.jest.json",
      },
    ],
  },
  rootDir: "./",
  testMatch: [
    "<rootDir>**/src/**/*.spec.(ts)",
    "<rootDir>**/src/**/*.integration.(ts)",
    "<rootDir>**/src/**/*.e2e-spec.(ts)",
  ],
  moduleNameMapper: {
    "#auth-context": "<rootDir>/src/auth-context/",
    "#logger-context": "<rootDir>/src/logger-context/",
    "#photo-context": "<rootDir>/src/photo-context/",
    "#tag-context": "<rootDir>/src/tag-context/",
    "^#shared/(.*)$": "<rootDir>/src/shared/$1",
  },
  globalSetup: "<rootDir>/jest/adapters/secondary/setup.ts",
};

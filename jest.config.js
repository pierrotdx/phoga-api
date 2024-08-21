/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  testMatch: [
    "<rootDir>**/src/**/*.spec.(ts)",
    "<rootDir>**/src/**/*.int-spec.(ts)",
    "<rootDir>**/src/**/*.e2e-spec.(ts)",
  ],
  rootDir: "./",
};

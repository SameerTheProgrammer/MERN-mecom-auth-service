/** @type {import('ts-jest').JestConfigWithTsJest} */
// eslint-disable-next-line no-undef
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,
    collectCoverage: true,
    coverageProvider: "v8",
    testTimeout: 10000, // in milliseconds
    collectCoverageFrom: ["src/**/*.ts", "!tests/**", "!**/node_modules/**"],
    // modulePathIgnorePatterns: ["/tests/sellers", "/tests/users"],
};

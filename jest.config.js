module.exports = {
  globalSetup: './src/setup-jest.ts',
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.(ts|js)',
    '!<rootDir>/src/index.(ts|js)',
    '!**/node_modules/**',
  ],
  rootDir: './',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/?(*.)(spec|test).(ts|js)',
    '<rootDir>/src/**/?(*.)(spec|test).(ts|js)',
    // '!<rootDir>/integrations/**/?(*.)(spec|test).(ts|js)'
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/database/*.(ts|js)',
    '<rootDir>/src/middlewares/index.(ts|js)'
  ],
  testEnvironment: 'node',
  moduleFileExtensions: [
    'ts',
    'js',
    'json'
  ],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  }
};

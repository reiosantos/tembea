require('@babel/register');
require('./env/loadConfig');

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!**/__tests__/**/*.js?(x)',
    '!**/node_modules/**',
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/?(*.)(spec|test)js',
    '<rootDir>/src/**/?(*.)(spec|test).js',
    '<rootDir>/integrations/**/?(*.)(spec|test).js'
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/database/migrations',
    '<rootDir>/src/database/seeders',
    '<rootDir>/src/database/models/index.js',
    '<rootDir>/src/middlewares/index.js'
  ],
  testEnvironment: 'node',
};

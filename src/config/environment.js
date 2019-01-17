require('dotenv').config();
const envExists = require('./utils');

const env = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_DIALECT: process.env.DATABASE_DIALECT,
  BUGSNAG_API_KEY: process.env.BUGSNAG_API_KEY,
  NODE_ENV: process.env.NODE_ENV || 'production',
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
};

module.exports = envExists(env);

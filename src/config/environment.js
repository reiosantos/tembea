require('dotenv').config();
const envExists = require('./utils');

const env = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_DIALECT: process.env.DATABASE_DIALECT,
  BUGSNAG_API_KEY: process.env.BUGSNAG_API_KEY,
  NODE_ENV: process.env.NODE_ENV || 'production',
};

module.exports = envExists(env);

const envExists = require('./utils');

const env = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_DIALECT: process.env.DATABASE_DIALECT,
  BUGSNAG_API_KEY: process.env.BUGSNAG_API_KEY,
  NODE_ENV: process.env.NODE_ENV || 'production',
  REDIS_URL: process.env.REDIS_URL || 'no-redis',
  THE_DOJO_ADDRESS: process.env.THE_DOJO_ADDRESS || 'Andela Nairobi',
  AIS_BASE_URL: process.env.AIS_BASE_URL,
  AIS_API_KEY: process.env.AIS_API_KEY,
};

module.exports = envExists(env);

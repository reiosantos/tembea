require('../load-env');

const environment = {
  ...process.env,
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'production',
  REDIS_URL: process.env.REDIS_URL || 'no-redis',
  DATABASE_URL: process.env.DATABASE_URL,
};

Object.assign(environment, {
  isDevelopment: environment.NODE_ENV === 'development' || environment.NODE_ENV === 'dev'
});

module.exports = environment;

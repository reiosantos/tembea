const env = require('./environment.js');

const appEnvironment = env.NODE_ENV;

const isDevelopment = (envname) => {
  const envName = envname.toLowerCase();
  return envName.indexOf('dev') !== -1;
};

const database = {
  [appEnvironment]: {
    databaseUrl: env.DATABASE_URL,
    dialect: env.DATABASE_DIALECT || 'postgres',
    logging: isDevelopment(env.NODE_ENV),
    use_env_variable: 'DATABASE_URL',
  },
};

// DO NOT CHANGE EVER!!!
module.exports = database;

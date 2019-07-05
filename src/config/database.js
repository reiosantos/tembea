const env = require('./environment.js');

const appEnvironment = env.NODE_ENV;

const database = {
  [appEnvironment]: {
    databaseUrl: env.DATABASE_URL,
    dialect: env.DATABASE_DIALECT || 'postgres',
    logging: false,
    use_env_variable: 'DATABASE_URL',
    operatorsAliases: false
  }
};

// DO NOT CHANGE EVER!!!
module.exports = database;

const dotenv = require('dotenv-extended');
const { resolve } = require('path');

const envName = process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : '';
const isDevelopment = envName === 'development';
const isTest = envName === 'test';
const path = resolve(__dirname, `../.env.${envName}`);

if ((isDevelopment || isTest)) {
  dotenv.load({
    silent: true,
    path,
    defaults: resolve(__dirname, '../.env'),
    schema: resolve(__dirname, '../.env.sample'),
    errorOnMissing: isDevelopment,
    errorOnExtra: false,
    errorOnRegex: false,
    overrideProcessEnv: true,
  });
}

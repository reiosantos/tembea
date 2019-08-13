const dotenv = require('dotenv-extended');
const { resolve } = require('path');

const envName = process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : '';
const isTest = envName === 'test';
const path = resolve(__dirname, `../.env.${envName}`);

dotenv.load({
  silent: true,
  path,
  defaults: resolve(__dirname, '../.env'),
  schema: resolve(__dirname, '../.env.sample'),
  errorOnMissing: !isTest,
  errorOnExtra: false,
  errorOnRegex: false,
  includeProcessEnv: true,
  overrideProcessEnv: true,
});

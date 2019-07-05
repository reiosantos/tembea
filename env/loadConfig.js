import dotenv from 'dotenv-extended';
import { resolve } from 'path';

const isTestEnvironment = process.env.NODE_ENV === 'test';
const dotenvFile = isTestEnvironment ? '.env.test' : '.env';

dotenv.load({
  silent: true,
  path: resolve(__dirname, dotenvFile),
  defaults: resolve(__dirname, '.env'),
  schema: resolve(__dirname, '.env.sample'),
  errorOnMissing: !isTestEnvironment,
  errorOnExtra: true,
  errorOnRegex: false,
  overrideProcessEnv: true,
});

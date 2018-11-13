
// a function to notifyNewTripRequests when some environment variables are unset
const generalOptionalEnvVariables = [
  'DATABASE_DIALECT',
  'DATABASE_HOST',
  'DATABASE_PORT',
  'DATABASE_PASSWORD',
];

const optionalEnvVariables = {
  development: generalOptionalEnvVariables,
  staging: generalOptionalEnvVariables,
  test: ['BUGSNAG_API_KEY', ...generalOptionalEnvVariables],
  production: generalOptionalEnvVariables,
};

module.exports = (env) => {
  const undefinedVariables = Object.keys(env)
    .filter(variable => env[variable] === undefined
    && !optionalEnvVariables[process.env.NODE_ENV].includes(variable));

  if (!undefinedVariables.length) return env;
  throw new Error(`
    \nThe following variables are required and missing in .env:
    \n${undefinedVariables.join('\n')}`);
};

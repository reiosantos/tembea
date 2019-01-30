import bugsnag from '@bugsnag/js';
import bugsnagExpress from '@bugsnag/plugin-express';
import env from '../config/environment';

export class Bugsnag {
  constructor(bugsnagApiKey) {
    this.bugsnagClient = null;
    const isTestEnv = Bugsnag.checkEnvironments('test');
    if (!isTestEnv && bugsnagApiKey) {
      /* istanbul ignore next */
      this.bugsnagClient = bugsnag({
        apiKey: bugsnagApiKey,
        autoNotify: true,
        appVersion: '0.0.1',
        appType: 'web_server'
      });

      this.bugsnagClient.use(bugsnagExpress);
    }
  }

  static checkEnvironments(...environments) {
    const { NODE_ENV } = env;
    return environments.includes(NODE_ENV);
  }

  createMiddleware() {
    if (this.bugsnagClient) {
      /* istanbul ignore next */
      return this.bugsnagClient.getPlugin('express');
    }
    return false;
  }

  init(app) {
    const { requestHandler } = this.createMiddleware();
    if (requestHandler) {
      app.use(requestHandler);
    }
  }

  errorHandler(app) {
    const { errorHandler } = this.createMiddleware();
    if (errorHandler) {
      app.use(errorHandler);
    }
  }

  log(error) {
    const isDev = Bugsnag.checkEnvironments('development', 'dev');
    if (this.bugsnagClient && !isDev) {
      this.bugsnagClient.notify(error);
    } else if (isDev) {
      // eslint-disable-next-line no-console
      console.error('Error: ', error);
    }
  }
}

const BugsnagHelper = new Bugsnag(process.env.BUGSNAG_API_KEY);
export default BugsnagHelper;

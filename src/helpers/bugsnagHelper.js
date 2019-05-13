import bugsnag from '@bugsnag/js';
import bugsnagExpress from '@bugsnag/plugin-express';

import env from '../config/environment';

export class Bugsnag {
  constructor(bugsnagApiKey) {
    this.bugsnagClient = null;
    const isTestOrDev = Bugsnag.checkEnvironments();
    if (!isTestOrDev && bugsnagApiKey) {
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

  static checkEnvironments(isTest = false) {
    const environments = ['test', 'development'];
    const {
      NODE_ENV
    } = env;
    return isTest ? ['test', 'testing'].includes(NODE_ENV) : environments.includes(NODE_ENV);
  }

  createMiddleware() {
    if (this.bugsnagClient) {
      /* istanbul ignore next */
      return this.bugsnagClient.getPlugin('express');
    }
    return false;
  }

  init(app) {
    const {
      requestHandler
    } = this.createMiddleware();
    if (requestHandler) {
      app.use(requestHandler);
    }
  }

  errorHandler(app) {
    const {
      errorHandler
    } = this.createMiddleware();
    if (errorHandler) {
      app.use(errorHandler);
    }
  }

  log(error) {
    if (this.bugsnagClient) {
      this.bugsnagClient.notify(error);
    } else if (!Bugsnag.checkEnvironments(true)) {
      // eslint-disable-next-line no-console
      console.error('Error: ', error);
    }
  }
}

const BugsnagHelper = new Bugsnag(process.env.BUGSNAG_API_KEY);
export default BugsnagHelper;

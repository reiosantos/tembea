import bugsnag from '@bugsnag/js';
import bugsnagExpress from '@bugsnag/plugin-express';
import env from '../config/environment';

const { NODE_ENV } = env;
const isDev = ['development', 'dev'].includes(NODE_ENV);

class BugsnagHelper {
  constructor() {
    this.bugsnagClient = null;
    if (!NODE_ENV.match('test')
      /* istanbul ignore next */
      && process.env.BUGSNAG_API_KEY
    ) {
      /* istanbul ignore next */
      this.bugsnagClient = bugsnag({
        apiKey: process.env.BUGSNAG_API_KEY,
        autoNotify: true,
        appVersion: '0.0.1',
        appType: 'web_server'
      });

      this.bugsnagClient.use(bugsnagExpress);
    }
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
    if (this.bugsnagClient && !isDev) {
      this.bugsnagClient.notify(error);
    } else if (isDev) {
      // eslint-disable-next-line no-console
      console.error('Error: ', error);
    }
  }
}

const bugsnagHelper = new BugsnagHelper();
export default bugsnagHelper;

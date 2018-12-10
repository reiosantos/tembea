import bugsnag from '@bugsnag/js';
import bugsnagExpress from '@bugsnag/plugin-express';

class BugsnagHelper {
  static createMiddleware() {
    if (!process.env.NODE_ENV.match('test')
  /* istanbul ignore next */
  && process.env.BUGSNAG_API_KEY
    ) {
    /* istanbul ignore next */
      const bugsnagClient = bugsnag({
        apiKey: process.env.BUGSNAG_API_KEY,
        autoNotify: true,
        appVersion: '0.0.1',
        appType: 'web_server'
      });

      bugsnagClient.use(bugsnagExpress);

      /* istanbul ignore next */
      const bugsnagMiddleware = bugsnagClient.getPlugin('express');
      return bugsnagMiddleware;
    }
    return false;
  }

  static init(app) {
    const { requestHandler } = BugsnagHelper.createMiddleware();
    if (requestHandler) {
      app.use(requestHandler);
    }
  }

  static errorHandler(app) {
    const { errorHandler } = BugsnagHelper.createMiddleware();
    if (errorHandler) {
      app.use(errorHandler);
    }
  }
}

export default BugsnagHelper;

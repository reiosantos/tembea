import bugsnagHelper from '../bugsnagHelper';


jest.mock('@bugsnag/js');

describe('bugsnag tests', () => {
  const app = { use: jest.fn() };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('createMiddleware', () => {
    it('should return false', () => {
      const result = bugsnagHelper.createMiddleware();

      expect(result).toBe(false);
    });
  });

  describe('init', () => {
    let requestHandler;

    it('should initialize and set requestHandler if requestHandler is truthy', () => {
      requestHandler = { requestHandler: 'requestHandler' };
      bugsnagHelper.createMiddleware = jest.fn().mockReturnValue(requestHandler);

      bugsnagHelper.init(app);

      expect(app.use).toHaveBeenCalled();
    });

    it('should NOT initialize and set requestHandler if requestHandler is undefined', () => {
      requestHandler = {};
      bugsnagHelper.createMiddleware = jest.fn().mockReturnValue(requestHandler);

      bugsnagHelper.init(app);

      expect(app.use).not.toHaveBeenCalled();
    });
  });

  describe('errorHandler', () => {
    let errorHandler;

    it('should initialize and set requestHandler if requestHandler is truthy', () => {
      errorHandler = { errorHandler: 'errorHandler' };
      bugsnagHelper.createMiddleware = jest.fn().mockReturnValue(errorHandler);

      bugsnagHelper.errorHandler(app);

      expect(app.use).toHaveBeenCalled();
    });

    it('should NOT initialize and set requestHandler if requestHandler is undefined', () => {
      errorHandler = {};
      bugsnagHelper.createMiddleware = jest.fn().mockReturnValue(errorHandler);

      bugsnagHelper.init(app);

      expect(app.use).not.toHaveBeenCalled();
    });
  });
});

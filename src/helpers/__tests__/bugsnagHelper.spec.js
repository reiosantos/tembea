import bugsnag from '@bugsnag/js';
import { Bugsnag } from '../bugsnagHelper';

jest.mock('@bugsnag/js');
jest.mock('@bugsnag/plugin-express');

const mockCheckEnvironments = (ENV) => {
  jest.spyOn(Bugsnag, 'checkEnvironments');
  Bugsnag.checkEnvironments
    .mockImplementation((...env) => env.includes(ENV));
};

describe('bugsnag tests', () => {
  const bugsnagApiKey = 'dummy key';
  const app = { use: jest.fn() };
  const mockedBugsnag = { use: jest.fn(), getPlugin: jest.fn(), notify: jest.fn() };

  beforeEach(() => {
    // const mockedBugsnag = { use: jest.fn(), getPlugin: jest.fn(), notify: jest.fn() };
    bugsnag.mockImplementation(() => (mockedBugsnag));
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should properly instantiate bugsnag when in production', () => {
    mockCheckEnvironments('production');
    const bugsnagHelper = new Bugsnag(bugsnagApiKey);
    expect(bugsnag).toHaveBeenCalledTimes(1);
    expect(bugsnag.mock.calls[0][0].apiKey).toEqual(bugsnagApiKey);
    expect(mockedBugsnag.use).toBeCalledTimes(1);
    expect(bugsnagHelper).toBeInstanceOf(Bugsnag);
  });

  describe('create middle', () => {
    let bugsnagHelper;
    it('should create middle from express plugin when in production environment', () => {
      mockCheckEnvironments('production');
      bugsnagHelper = new Bugsnag(bugsnagApiKey);
      mockedBugsnag.getPlugin.mockReturnValue('express');
      const result = bugsnagHelper.createMiddleware();
      expect(mockedBugsnag.getPlugin).toBeCalledWith('express');
      expect(result).toBe('express');
    });
    it('should not create middle from express plugin when in test environment', () => {
      mockCheckEnvironments('test');
      bugsnagHelper = new Bugsnag(bugsnagApiKey);
      mockedBugsnag.getPlugin.mockReturnValue('express');
      const result = bugsnagHelper.createMiddleware();
      expect(result).toBeFalsy();
      expect(mockedBugsnag.getPlugin).not.toBeCalled();
    });
  });

  describe('log', () => {
    const error = new Error('notify bugsnag');
    let bugsnagHelper;
    beforeEach(() => {
      jest.spyOn(console, 'error').mockReturnValue();
    });
    it('should notify bugsnag when error occurs in production', () => {
      mockCheckEnvironments('production');
      bugsnagHelper = new Bugsnag(bugsnagApiKey);
      bugsnagHelper.log(error);
      expect(mockedBugsnag.notify).toBeCalledWith(error);
    });
    it('should log via console in dev environment', () => {
      mockCheckEnvironments('development');
      bugsnagHelper = new Bugsnag(bugsnagApiKey);
      bugsnagHelper.log(error);
      // eslint-disable-next-line no-console
      expect(console.error).toBeCalledWith('Error: ', error);
      expect(mockedBugsnag.notify).not.toBeCalled();
    });
    it('should do nothing in test environment', () => {
      mockCheckEnvironments('test');
      bugsnagHelper = new Bugsnag(bugsnagApiKey);
      bugsnagHelper.log(error);
      // eslint-disable-next-line no-console
      expect(console.error).not.toBeCalled();
      expect(mockedBugsnag.notify).not.toBeCalled();
    });
  });

  describe('errorHandler', () => {
    let bugsnagHelper;
    beforeEach(() => {
      mockCheckEnvironments('production');
      bugsnagHelper = new Bugsnag(bugsnagApiKey);
    });
    it('should initialize and set requestHandler if requestHandler is truthy', () => {
      mockedBugsnag.getPlugin.mockReturnValue({ errorHandler: 'errorHandler' });
      bugsnagHelper.errorHandler(app);
      expect(app.use).toHaveBeenCalled();
    });

    it('should NOT initialize and set requestHandler if requestHandler is undefined', () => {
      mockedBugsnag.getPlugin.mockReturnValue({});
      bugsnagHelper.init(app);
      expect(app.use).not.toHaveBeenCalled();
    });
  });

  describe('init', () => {
    let requestHandler;
    let bugsnagHelper;
    beforeEach(() => {
      mockCheckEnvironments('production');
      bugsnagHelper = new Bugsnag(bugsnagApiKey);
    });
    it('should initialize and set requestHandler if requestHandler is truthy', () => {
      requestHandler = { requestHandler: 'requestHandler' };
      mockedBugsnag.getPlugin.mockReturnValue(requestHandler);
      bugsnagHelper.init(app);
      expect(app.use).toHaveBeenCalled();
    });

    it('should NOT initialize and set requestHandler if requestHandler is undefined', () => {
      requestHandler = {};
      mockedBugsnag.getPlugin.mockReturnValue(requestHandler);
      bugsnagHelper.init(app);
      expect(app.use).not.toHaveBeenCalled();
    });
  });
});

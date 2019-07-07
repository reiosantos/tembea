import AISController from '../AISController';
import aisService from '../../../services/AISService';
import AISDataMock from '../__mocks__/AISData.mock';
import HttpError from '../../../helpers/errorHandler';
import BugsnagHelper from '../../../helpers/bugsnagHelper';

describe('AISController', () => {
  let req;
  let res;
  beforeEach(() => {
    req = {
      query: {
        email: 'test@test.com'
      }
    };

    res = {
      status: jest.fn(() => ({
        json: jest.fn(() => {})
      })).mockReturnValue({ json: jest.fn() })
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('/getUserDetails', () => {
    it('should return user data from AIS', async () => {
      aisService.getUserDetails = jest.fn().mockResolvedValue(AISDataMock);

      await AISController.getUserDataByEmail(req, res);
      expect(res.status).toBeCalledTimes(1);
      expect(res.status).toBeCalledWith(200);
      expect(res.status().json).toHaveBeenCalledWith({ aisUserData: AISDataMock, success: 'true' });
    });

    it('should handle errors', async () => {
      aisService.getUserDetails = jest.fn().mockRejectedValue(new Error('Failing for a test'));
      HttpError.sendErrorResponse = jest.fn().mockReturnValue({});
      BugsnagHelper.log = jest.fn().mockReturnValue({});
      await AISController.getUserDataByEmail(req, res);
      expect(HttpError.sendErrorResponse).toBeCalledTimes(1);
      expect(BugsnagHelper.log).toBeCalledTimes(1);
    });
  });
});

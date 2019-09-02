import Response from '../../helpers/responseHelper';
import HomeBaseFilterValidator from '../HomeBaseFilterValidator';

describe('HomeBaseFilterValidator', () => {
  let ResponseSpy;
  let next;
  let req;
  let res;
  beforeAll(() => {
    ResponseSpy = jest.spyOn(Response, 'sendResponse');
    next = jest.fn();
    res = {
      status: jest.fn(() => ({
        json: jest.fn()
      }))
    };
    req = { headers: {}, currentUser: { userInfo: { roles: ['Super Admin'], locations: [] } } };
  });

  it('should throw error if homebaseId is missing in headers', async () => {
    await HomeBaseFilterValidator.validateHomeBaseAccess(req, res, next);
    expect(ResponseSpy).toHaveBeenCalledWith(res, 400, false,
      'Missing HomebaseId in request headers');
  });

  it('should throw permission error if user doesnot permission to view location info',
    async () => {
      req.headers = { homebaseid: 1 };
      await HomeBaseFilterValidator.validateHomeBaseAccess(req, res, next);
      expect(ResponseSpy).toHaveBeenCalledWith(res, 403, false,
        'You dont have permissions to view this location data');
    });

  it('should call next if the user has permission to view other location data', async () => {
    req.currentUser.userInfo.locations = [{ id: 1 }];
    req.headers = { homebaseid: 1 };
    await HomeBaseFilterValidator.validateHomeBaseAccess(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

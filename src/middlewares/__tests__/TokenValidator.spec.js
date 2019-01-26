import TokenValidator from '../TokenValidator';
import Response from '../../helpers/responseHelper';
import Utils from '../../utils';

describe('Token Validator', () => {
  describe('Authenticate token method', () => {
    let nextMock;
    let responseMock;

    beforeEach(() => {
      nextMock = jest.fn();
      responseMock = jest.spyOn(Response, 'sendResponse').mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should call sendResponse function with No token provided message', async () => {
      const req = { headers: {}, envSecretKey: 'secret' };

      await TokenValidator.authenticateToken(req, 'res', nextMock);
      expect(responseMock).toHaveBeenCalledTimes(1);
      expect(responseMock).toHaveBeenCalledWith('res', 401, false, 'No token provided');
      expect(nextMock).toHaveBeenCalledTimes(0);
    });

    it('should decode token and call next method', async () => {
      const req = { headers: { authorization: 'token' }, envSecretKey: 'secret' };
      const utilsMock = jest.spyOn(Utils, 'verifyToken').mockResolvedValue('decoded');

      await TokenValidator.authenticateToken(req, 'res', nextMock);
      expect(responseMock).toHaveBeenCalledTimes(0);
      expect(utilsMock).toHaveBeenCalledTimes(1);
      expect(utilsMock).toHaveBeenCalledWith('token', 'secret');
      expect(req.currentUser).toEqual('decoded');
      expect(nextMock).toHaveBeenCalledTimes(1);
    });

    it('should throw an error and call sendResponse function with authentication failed message', async () => {
      const req = { headers: { authorization: 'token' }, envSecretKey: 'secret' };
      const errMock = new Error('Fail');
      const utilsMock = jest
        .spyOn(Utils, 'verifyToken')
        .mockRejectedValue(errMock);

      try {
        await TokenValidator.authenticateToken(req, 'res', nextMock);
      } catch (error) {
        expect(error).toEqual(errMock);
      }
      expect(utilsMock).toHaveBeenCalledTimes(1);
      expect(utilsMock).toHaveBeenCalledWith('token', 'secret');
      expect(nextMock).toHaveBeenCalledTimes(0);
      expect(responseMock).toHaveBeenCalledTimes(1);
      expect(responseMock).toHaveBeenCalledWith(
        'res', 401, false, 'Failed to authenticate token! Valid token required'
      );
    });
  });

  describe('Validate Role method', () => {
    let nextMock;
    let responseMock;

    beforeEach(() => {
      nextMock = jest.fn();
      responseMock = jest.spyOn(Response, 'sendResponse').mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should call sendResponse method with Unauthorized message', async () => {
      const reqMock = { currentUser: { userInfo: { roles: ['Admin'] } } };
      await TokenValidator.validateRole(reqMock, 'res', nextMock);

      expect(responseMock).toHaveBeenCalledTimes(1);
      expect(responseMock).toHaveBeenCalledWith('res', 401, false, 'Unauthorized access');
      expect(nextMock).toHaveBeenCalledTimes(0);
    });

    it('should call next method', async () => {
      const reqMock = { currentUser: { userInfo: { roles: ['Super Admin'] } } };
      await TokenValidator.validateRole(reqMock, 'res', nextMock);

      expect(responseMock).toHaveBeenCalledTimes(0);
      expect(nextMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('attachJWTSecretKey method', () => {
    let nextMock;

    beforeEach(() => {
      nextMock = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should attach andelaJWTKey to req object and call next method', async () => {
      const reqMock = { path: '/auth/verify' };
      await TokenValidator.attachJwtSecretKey(reqMock, 'res', nextMock);

      expect(reqMock.envSecretKey).toEqual('JWT_ANDELA_KEY');
      expect(nextMock).toHaveBeenCalledTimes(1);
    });

    it('should attach andelaJWTKey to req object and call next method', async () => {
      const reqMock = { path: '/user' };
      await TokenValidator.attachJwtSecretKey(reqMock, 'res', nextMock);

      expect(reqMock.envSecretKey).toEqual('JWT_TEMBEA_SECRET');
      expect(nextMock).toHaveBeenCalledTimes(1);
    });
  });
});

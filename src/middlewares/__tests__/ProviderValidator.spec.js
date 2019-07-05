import ProviderValidator from '../ProviderValidator';
import HttpError from '../../helpers/errorHandler';
import GeneralValidator from '../GeneralValidator';
import UserService from '../../services/UserService';
import Response from '../../helpers/responseHelper';
import ProviderService from '../../services/ProviderService';

describe('ProviderValidator', () => {
  let res;
  let next;
  let req;
  beforeEach(() => {
    res = {
      status: jest.fn(() => ({
        json: jest.fn()
      }))
    };
    next = jest.fn();
    HttpError.sendErrorResponse = jest.fn();
    Response.sendResponse = jest.fn();
  });

  afterEach((done) => {
    jest.restoreAllMocks();
    done();
  });
  describe('Provider_verifyProviderUpdateBody', () => {
    let httpSpy;
    beforeEach(() => {
      httpSpy = jest.spyOn(HttpError, 'sendErrorResponse');
    });
    it('should validate update parameters ', async () => {
      const error = { message: { invalidParameter: 'Id should be a valid integer' } };
      req = {
        params: { id: 'notValid' },
        body: {}
      };
      httpSpy.mockReturnValue(error);
      jest.spyOn(GeneralValidator, 'validateNumber');
      await ProviderValidator.verifyProviderUpdateBody(req, res, next);
      expect(GeneralValidator.validateNumber).toBeCalled();
      expect(httpSpy).toBeCalled();
    });

    it('should validate empty request body', async () => {
      req = {
        params: { id: 1 },
        body: {}
      };
      jest.spyOn(GeneralValidator, 'validateReqBody');
      await ProviderValidator.verifyProviderUpdateBody(req, res, next);
      expect(GeneralValidator.validateReqBody).toBeCalled();
      expect(GeneralValidator.validateReqBody).toBeCalledWith({}, 'name', 'email');
      expect(httpSpy).toBeCalled();
    });

    it('should validate empty request body values', async () => {
      req = {
        params: { id: 1 },
        body: {
          name: '',
          email: 'me@email.com'
        }
      };
      jest.spyOn(GeneralValidator, 'validateEmptyReqBodyProp');
      await ProviderValidator.verifyProviderUpdateBody(req, res, next);
      expect(GeneralValidator.validateEmptyReqBodyProp).toBeCalled();
      expect(GeneralValidator.validateEmptyReqBodyProp).toBeCalledWith(
        {
          name: '',
          email: 'me@email.com'
        }, 'name', 'email'
      );
      expect(httpSpy).toBeCalled();
    });

    it('should return next if valid update body ', async () => {
      req = {
        params: { id: 1 },
        body: { email: 'me@email.com' }
      };
      jest.spyOn(GeneralValidator, 'validateEmptyReqBodyProp');
      jest.spyOn(GeneralValidator, 'validateReqBody');
      jest.spyOn(GeneralValidator, 'validateNumber');
      await ProviderValidator.verifyProviderUpdateBody(req, res, next);
      expect(httpSpy).not.toBeCalled();
      expect(GeneralValidator.validateNumber).toBeCalled();
      expect(GeneralValidator.validateReqBody).toBeCalled();
      expect(GeneralValidator.validateEmptyReqBodyProp).toBeCalled();
      expect(next).toBeCalled();
    });
    it('should return update object successfully', async () => {
      const userId = { dataValues: { id: 1 } };
      jest.spyOn(UserService, 'getUserByEmail')
        .mockReturnValue(userId);
      const body = {
        email: 'myemail@gmail.com',
        name: 'Uber Nairobi',
      };
      const updateData = await ProviderValidator.createUpdateBody(body);
      expect(UserService.getUserByEmail).toBeCalled();
      expect(updateData).toEqual({
        name: 'Uber Nairobi',
        providerUserId: 1
      });
    });
    it('should return message if user doesnt exist', async () => {
      jest.spyOn(UserService, 'getUserByEmail')
        .mockReturnValue(null);
      const body = {
        email: 'myemail@gmail.com',
        name: 'Uber Nairobi',
      };
      const updateData = await ProviderValidator.createUpdateBody(body);
      expect(UserService.getUserByEmail).toBeCalled();
      expect(updateData).toEqual({ message: 'User with email doesnt exist' });
    });
  });

  describe('ProviderValidator_validateReqBody', () => {
    it('returns error if there are missing params in request', () => {
      const error = '"name" is not allowed to be empty';
      req = {
        body: {
          email: 'allan@andela.com',
          name: ''
        }
      };
      ProviderValidator.validateReqBody(req, res, next);
      expect(Response.sendResponse).toHaveBeenCalledWith(res, 400, false, error);
    });

    it('validates the PATCH method', () => {
      const error = '"value" must have at least 1 children';
      req = {
        method: 'PATCH',
        body: {}
      };
      ProviderValidator.validateReqBody(req, res, next);
      expect(Response.sendResponse).toHaveBeenCalledWith(res, 400, false, error);
    });

    it('returns next', () => {
      req = {
        body: {
          email: 'allan@andela.com',
          name: 'all'
        }
      };
    });
  });

  describe('ProviderValidator_validateUserExistence', () => {
    let getUserSpy;
    req = {
      body: {
        email: 'allan@andela.com',
        name: 'Uber'
      }
    };

    beforeEach(() => {
      getUserSpy = jest.spyOn(UserService, 'getUserByEmail');
    });

    it('returns an error message if user does not exist', async () => {
      getUserSpy.mockResolvedValue(null);
      const err = 'The user with email: \'allan@andela.com\' does not exist';
      await ProviderValidator.validateUserExistence(req, res, next);
      expect(UserService.getUserByEmail).toHaveBeenCalledWith(req.body.email);
      expect(Response.sendResponse).toHaveBeenCalledWith(res, 404, false, err);
    });

    it('returns next', async () => {
      const mockUser = {
        name: 'Allan',
        email: 'allan@allan.com'
      };
      getUserSpy.mockResolvedValue(mockUser);
      await ProviderValidator.validateUserExistence(req, res, next);
      expect(UserService.getUserByEmail).toHaveBeenCalledWith(req.body.email);
      expect(next).toHaveBeenCalled();
    });
  });
  describe('ProviderValidator_validateDriverRequestBody', () => {
    it('should throw errors if fields are missing in body', async () => {
      const createReq = {
        body: {
          driverName: 'Muhwezi Deo',
          driverNumber: '42220222',
          email: 'Test@test.com'
        }
      };
      await ProviderValidator.validateDriverRequestBody(createReq, res, next);
      expect(Response.sendResponse).toHaveBeenCalledWith(res, 400,
        false, ['"driverPhoneNo" is required', '"providerId" is required']);
    });
    it('should throw errors if a field is empty', async () => {
      const createReq = {
        body: {
          driverName: '',
          driverNumber: '42220222',
          email: 'Test@test.com',
          driverPhoneNo: '07042211313',
          providerId: 1
        }
      };
      await ProviderValidator.validateDriverRequestBody(createReq, res, next);
      expect(Response.sendResponse).toHaveBeenCalledWith(res, 400,
        false, ['"driverName" is not allowed to be empty']);
    });
    it('should call next if request body is valid', async () => {
      const createReq = {
        body: {
          driverName: 'Test User',
          driverNumber: '42220222',
          email: 'Test@test.com',
          driverPhoneNo: '07042211313',
          providerId: 1
        }
      };
      await ProviderValidator.validateDriverRequestBody(createReq, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
  describe('ProviderValidator_validateProviderExistence', () => {
    it('should send error if a provider doesnt exist', async () => {
      const createReq = {
        body: {
          driverName: 'Test User',
          driverNumber: '42220222',
          email: 'Test@test.com',
          driverPhoneNo: '07042211313',
          providerId: 1
        }
      };
      jest.spyOn(ProviderService, 'findProviderByPk').mockReturnValue(null);
      await ProviderValidator.validateProviderExistence(createReq, res, next);
      expect(Response.sendResponse).toBeCalledWith(res, 404, false, 'Provider doesnt exist');
    });
    it('should call next if provider exists', async () => {
      const createReq = {
        body: {
          driverName: 'Test User',
          driverNumber: '42220222',
          email: 'Test@test.com',
          driverPhoneNo: '07042211313',
          providerId: 1
        }
      };
      jest.spyOn(ProviderService, 'findProviderByPk').mockReturnValue({
        name: 'Test Provider',
        email: 'test@test.com'
      });
      await ProviderValidator.validateProviderExistence(createReq, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
  describe('ProviderValidator_validateProviderIDQuery', () => {
    it('should not throw an error when the providerID is an integer', async () => {
      const createReq = {
        query: {
          providerId: 1
        }
      };
      await ProviderValidator.validateQueryProvider(createReq, res, next);
      expect(next).toHaveBeenCalled();
    });
    it('should throw an error when the providerID is not an integer', async () => {
      const createReq = {
        query: {
          providerId: 'test'
        }
      };
      await ProviderValidator.validateQueryProvider(createReq, res, next);
      expect(Response.sendResponse)
        .toBeCalledWith(res, 404, false, 'Please provide a positive integer value for providerID');
    });
    it('should return next when the providerID is not provided', async () => {
      const createReq = {
        query: {}
      };
      await ProviderValidator.validateQueryProvider(createReq, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});

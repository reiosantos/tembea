import ProviderValidator from '../ProviderValidator';
import HttpError from '../../helpers/errorHandler';
import GeneralValidator from '../GeneralValidator';
import UserService from '../../services/UserService';

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
  });

  afterEach((done) => {
    jest.restoreAllMocks();
    done();
  });
  describe('Provider_verifyProviderUpdateBody', async () => {
    let httpSpy;
    beforeEach(() => {
      httpSpy = jest.spyOn(HttpError, 'sendErrorResponse');
    });
    it('should validate update parameters ', async () => {
      const error = { message: { invalidParameter: 'Id should be a valid integer' } };
      req = { params: { id: 'notValid' }, body: {} };
      httpSpy.mockReturnValue(error);
      jest.spyOn(GeneralValidator, 'validateNumber');
      await ProviderValidator.verifyProviderUpdateBody(req, res, next);
      expect(GeneralValidator.validateNumber).toBeCalled();
      expect(httpSpy).toBeCalled();
    });

    it('should validate empty request body', async () => {
      req = { params: { id: 1 }, body: {} };
      jest.spyOn(GeneralValidator, 'validateReqBody');
      await ProviderValidator.verifyProviderUpdateBody(req, res, next);
      expect(GeneralValidator.validateReqBody).toBeCalled();
      expect(GeneralValidator.validateReqBody).toBeCalledWith({}, 'name', 'email');
      expect(httpSpy).toBeCalled();
    });

    it('should validate empty request body values', async () => {
      req = { params: { id: 1 }, body: { name: '', email: 'me@email.com' } };
      jest.spyOn(GeneralValidator, 'validateEmptyReqBodyProp');
      await ProviderValidator.verifyProviderUpdateBody(req, res, next);
      expect(GeneralValidator.validateEmptyReqBodyProp).toBeCalled();
      expect(GeneralValidator.validateEmptyReqBodyProp).toBeCalledWith(
        { name: '', email: 'me@email.com' }, 'name', 'email'
      );
      expect(httpSpy).toBeCalled();
    });

    it('should return next if valid update body ', async () => {
      req = { params: { id: 1 }, body: { email: 'me@email.com' } };
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
      jest.spyOn(UserService, 'getUserByEmail').mockReturnValue(userId);
      const body = { email: 'myemail@gmail.com', name: 'Uber Nairobi', };
      const updateData = await ProviderValidator.createUpdateBody(body);
      expect(UserService.getUserByEmail).toBeCalled();
      expect(updateData).toEqual({ name: 'Uber Nairobi', providerUserId: 1 });
    });
    it('should return message if user doesnt exist', async () => {
      jest.spyOn(UserService, 'getUserByEmail').mockReturnValue(null);
      const body = { email: 'myemail@gmail.com', name: 'Uber Nairobi', };
      const updateData = await ProviderValidator.createUpdateBody(body);
      expect(UserService.getUserByEmail).toBeCalled();
      expect(updateData).toEqual({ message: 'User with email doesnt exist' });
    });
  });
});

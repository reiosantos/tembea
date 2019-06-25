import UserValidator from '../UserValidator';
import HttpError from '../../helpers/errorHandler';

let nextMock;
let resMock;
let reqMock;
let res;
describe('UserValidator', () => {
  beforeEach(() => {
    nextMock = jest.fn();
    resMock = jest.spyOn(HttpError, 'sendErrorResponse').mockImplementation();
    reqMock = {
      body: {
        email: 'johnsmith',
        roleName: 'admin'
      }
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('validateAssignRole Method', () => {
    it('should call sendResponse method', () => {
      UserValidator.validateAssignRole(reqMock, res, nextMock);
      expect(resMock).toHaveBeenCalledTimes(1);
      expect(nextMock).not.toHaveBeenCalled();
    });
  });

  describe('getUserRoles', () => {
    it('should call sendResponse method', () => {
      UserValidator.getUserRoles({ query: { email: 'abc' } }, res, nextMock);
      expect(resMock).toHaveBeenCalledTimes(1);
      expect(nextMock).not.toHaveBeenCalled();
    });
  });

  describe('validateNewRole', () => {
    it('should call sendResponse method', () => {
      UserValidator.validateNewRole({ body: { roleName: '' } }, res, nextMock);
      expect(resMock).toHaveBeenCalledTimes(1);
      expect(nextMock).not.toHaveBeenCalled();
    });
  });
});

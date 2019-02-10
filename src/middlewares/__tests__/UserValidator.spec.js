import UserValidator from '../UserValidator';
import Response from '../../helpers/responseHelper';
import GeneralValidator from '../GeneralValidator';

describe('UserValidator', () => {
  describe('getPropName Method', () => {
    it('should return an array with roleName as a parameter', () => {
      const reqMock = { body: { roleName: 'rolex' }, query: {}, path: '/role' };
      const result = UserValidator.getPropName(reqMock);

      expect(result).toEqual(['rolex', 'roleName']);
    });

    it('should return an array with email as a parameter', () => {
      const reqMock = {
        body: 'body', query: { email: 't122@email.com' }, path: '/roles/user', method: 'GET'
      };
      const result = UserValidator.getPropName(reqMock);

      expect(result).toEqual(['t122@email.com', 'email as a query param']);
    });
  });

  describe('validateEmailOrRoleNameOrPassword Method', () => {
    let nextMock;
    let resMock;
    let getPropMock;

    beforeEach(() => {
      nextMock = jest.fn();
      resMock = jest.spyOn(Response, 'sendResponse').mockImplementation();
      getPropMock = jest
        .spyOn(UserValidator, 'getPropName')
        .mockReturnValue(['p1', 'pName']);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should call sendResponse method', () => {
      const validatePropMock = jest
        .spyOn(GeneralValidator, 'validateProp')
        .mockReturnValue(['']);

      UserValidator.validateEmailOrRoleName('req', 'res', nextMock);
      expect(getPropMock).toHaveBeenCalledTimes(1);
      expect(getPropMock).toHaveBeenCalledWith('req');
      expect(validatePropMock).toHaveBeenCalledWith('p1', 'pName');
      expect(resMock).toHaveBeenCalledTimes(1);
      expect(resMock).toHaveBeenCalledWith('res', 400, false, ['']);
      expect(nextMock).not.toHaveBeenCalled();
    });

    it('should call next method', () => {
      const validatePropMock = jest
        .spyOn(GeneralValidator, 'validateProp')
        .mockReturnValue([]);

      UserValidator.validateEmailOrRoleName('req', 'res', nextMock);
      expect(getPropMock).toHaveBeenCalledTimes(1);
      expect(getPropMock).toHaveBeenCalledWith('req');
      expect(validatePropMock).toHaveBeenCalledWith('p1', 'pName');
      expect(resMock).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledTimes(1);
    });
  });
});

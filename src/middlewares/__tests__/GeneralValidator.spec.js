import GeneralValidator from '../GeneralValidator';
import Response from '../../helpers/responseHelper';

describe('General Validator', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('validateProp method', () => {
    it('should return error message when prop is invalid', () => {
      const result = GeneralValidator.validateProp('', 'role');
      expect(result).toEqual(['Please Provide a role']);
    });

    it('should return an empty array when prop is valid', () => {
      const result = GeneralValidator.validateProp('admin', 'role');
      expect(result).toEqual([]);
    });
  });

  describe('validate Number', () => {
    it('should return true when number is valid', () => {
      const result = GeneralValidator.validateNumber(1);
      expect(result).toEqual(true);
    });
  });

  describe('validate Object Key and Values', () => {
    it('should return errors when the object passed has empty keyValues', () => {
      const body = { name: '', game: '' };
      const result = GeneralValidator.validateObjectKeyValues(body);
      expect(result).toEqual(['name cannot be empty', 'game cannot be empty']);
    });
  });

  describe('Validate All parameters provided in the request body', () => {
    it('should call the next method when they are no errors', () => {
      const reqMock = { body: { name: 'Go' } };
      const nextMock = jest.fn();
      jest.spyOn(GeneralValidator, 'validateObjectKeyValues').mockReturnValue([]);
      jest.spyOn(Response, 'sendResponse').mockImplementation();

      GeneralValidator.validateAllProvidedReqBody(reqMock, 'res', nextMock);
      expect(nextMock).toHaveBeenCalledTimes(1);
      expect(Response.sendResponse).not.toHaveBeenCalled();
    });

    it('should call the response method when they are errors', () => {
      const reqMock = { body: { name: 'Go' } };
      const nextMock = jest.fn();
      jest.spyOn(GeneralValidator, 'validateObjectKeyValues').mockReturnValue(['boo']);
      jest.spyOn(Response, 'sendResponse').mockImplementation(() => {});

      GeneralValidator.validateAllProvidedReqBody(reqMock, 'res', nextMock);
      expect(nextMock).not.toHaveBeenCalled();
      expect(Response.sendResponse).toHaveBeenCalledTimes(1);
      expect(Response.sendResponse).toHaveBeenCalledWith('res', 400, false, ['boo']);
    });
  });

  describe('validate Team Url', () => {
    it('should return true when teamUrl matches the regex', () => {
      const result = GeneralValidator.validateTeamUrl('aaa@slack.com');
      expect(result).toEqual(false);
    });
  });

  describe('Validate TeamUrl in the request body', () => {
    it('should call next method when teamUrl exists in body and when it\'s valid', () => {
      const reqMock = { body: { teamUrl: 'lala@slack.com' } };
      const nextMock = jest.fn();
      jest.spyOn(Response, 'sendResponse').mockImplementation();
      jest.spyOn(GeneralValidator, 'validateTeamUrl').mockReturnValue(true);

      GeneralValidator.validateTeamUrlInRequestBody(reqMock, 'res', nextMock);
      expect(nextMock).toHaveBeenCalledTimes(1);
      expect(Response.sendResponse).not.toHaveBeenCalled();
    });

    it('should call response method when teamUrl doesn\'t exist with error message', () => {
      const reqMock = { body: { teamUrl: false } };
      const nextMock = jest.fn();
      const err = 'Please pass the teamUrl in the request body, e.g: "teamUrl: dvs.slack.com"';
      jest.spyOn(Response, 'sendResponse').mockImplementation();
      jest.spyOn(GeneralValidator, 'validateTeamUrl').mockReturnValue(true);

      GeneralValidator.validateTeamUrlInRequestBody(reqMock, 'res', nextMock);
      expect(nextMock).not.toHaveBeenCalled();
      expect(Response.sendResponse).toHaveBeenCalledTimes(1);
      expect(Response.sendResponse).toHaveBeenCalledWith('res', 400, false, err);
    });
  });
});

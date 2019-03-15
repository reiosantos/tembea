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
      jest
        .spyOn(GeneralValidator, 'validateObjectKeyValues')
        .mockReturnValue([]);
      jest.spyOn(Response, 'sendResponse').mockImplementation();

      GeneralValidator.validateAllProvidedReqBody(reqMock, 'res', nextMock);
      expect(nextMock).toHaveBeenCalledTimes(1);
      expect(Response.sendResponse).not.toHaveBeenCalled();
    });

    it('should call the response method when they are errors', () => {
      const reqMock = { body: { name: 'Go' } };
      const nextMock = jest.fn();
      jest
        .spyOn(GeneralValidator, 'validateObjectKeyValues')
        .mockReturnValue(['boo']);
      jest.spyOn(Response, 'sendResponse').mockImplementation(() => {});

      GeneralValidator.validateAllProvidedReqBody(reqMock, 'res', nextMock);
      expect(nextMock).not.toHaveBeenCalled();
      expect(Response.sendResponse).toHaveBeenCalledTimes(1);
      expect(Response.sendResponse).toHaveBeenCalledWith('res', 400, false, [
        'boo'
      ]);
    });
  });

  describe('validate Team Url', () => {
    it('should return true when teamUrl matches the regex', () => {
      const result = GeneralValidator.validateTeamUrl('aaa@slack.com');
      expect(result).toEqual(false);
    });
  });

  describe('Validate TeamUrl in the request body', () => {
    it("should call next method when teamUrl exists in body and when it's valid", () => {
      const reqMock = { body: { teamUrl: 'lala@slack.com' } };
      const nextMock = jest.fn();
      jest.spyOn(Response, 'sendResponse').mockImplementation();
      jest.spyOn(GeneralValidator, 'validateTeamUrl').mockReturnValue(true);

      GeneralValidator.validateTeamUrlInRequestBody(reqMock, 'res', nextMock);
      expect(nextMock).toHaveBeenCalledTimes(1);
      expect(Response.sendResponse).not.toHaveBeenCalled();
    });

    it("should call response method when teamUrl doesn't exist with error message", () => {
      const reqMock = { body: { teamUrl: false } };
      const nextMock = jest.fn();
      const err = 'Please pass the teamUrl in the request body, e.g: "teamUrl: dvs.slack.com"';
      jest.spyOn(Response, 'sendResponse').mockImplementation();
      jest.spyOn(GeneralValidator, 'validateTeamUrl').mockReturnValue(true);

      GeneralValidator.validateTeamUrlInRequestBody(reqMock, 'res', nextMock);
      expect(nextMock).not.toHaveBeenCalled();
      expect(Response.sendResponse).toHaveBeenCalledTimes(1);
      expect(Response.sendResponse).toHaveBeenCalledWith(
        'res',
        400,
        false,
        err
      );
    });
  });
  describe('Validate for empty tripStatus parameter', () => {
    it('should return true for an empty status parameter', () => {
      const result = GeneralValidator.isEmpty();
      expect(result).toEqual(true);
    });
  });
  describe('Validate tripStatus query parameter', () => {
    it('should return true if tripStatus is Confirmed or Pending.', () => {
      const result = GeneralValidator.isTripStatus('Confirmed');
      expect(result).toEqual(true);
    });
    it('should return false if tripStatus is neither Confirmed nor Pending', () => {
      const result = GeneralValidator.isTripStatus('Confirm');
      expect(result).toEqual(false);
    });
  });
  describe('Validate get all trips filter parameters.', () => {
    it('should call next method when trip status is correct', () => {
      const reqMock = { query: { status: 'Pending' } };
      const nextMock = jest.fn();

      jest.spyOn(GeneralValidator, 'isEmpty').mockReturnValue(true);
      jest.spyOn(GeneralValidator, 'isTripStatus').mockReturnValue(true);

      GeneralValidator.validateTripFilterParameters(reqMock, 'res', nextMock);
      expect(nextMock).toHaveBeenCalled();
    });
    it('should return error when trip stauts is not correct', () => {
      const reqMock = { query: { status: 'Pend' } };
      const nextMock = jest.fn();
      const err = 'Status of trips are either Confirmed or Pending';
      jest.spyOn(GeneralValidator, 'isEmpty').mockReturnValue(false);
      jest.spyOn(GeneralValidator, 'isTripStatus').mockReturnValue(false);
      jest.spyOn(Response, 'sendResponse').mockImplementation();

      GeneralValidator.validateTripFilterParameters(reqMock, 'res', nextMock);
      expect(nextMock).not.toHaveBeenCalled();
      expect(Response.sendResponse).toHaveBeenCalledWith(
        'res',
        400,
        false,
        err
      );
    });
  });

  describe('validatePhoneNumber regex', () => {
    it('should return true if the value is correct', () => {
      const phoneNumber = '+2547 868 9800';
      const result = GeneralValidator.validatePhoneNo(phoneNumber);
      expect(result).toEqual(true);
    });

    it('should return false if the value is not correct', () => {
      const phoneNumber = '-------5';
      const result = GeneralValidator.validatePhoneNo(phoneNumber);
      expect(result).toEqual(false);
    });
  });

  describe('disableNumericsAsValues', () => {
    it('should return true if the value matches the regex', () => {
      const value = '5th Avenue Street';
      const result = GeneralValidator.disallowNumericsAsValuesOnly(value);
      expect(result).toEqual(true);
    });

    it('should return false if the value does not match the regex', () => {
      const value = '3094545';
      const result = GeneralValidator.disallowNumericsAsValuesOnly(value);
      expect(result).toEqual(false);
    });
  });
});

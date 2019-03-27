import CountryService from '../../services/CountryService';
import CountryHelper from '../CountryHelper';
import
{
  countryMock, deletedCountryMock, mockError, mockAPIFail
}
  from '../__mocks__/countryHelperMock';

describe('CountryHelper', () => {
  let countrySpy;
  let name;

  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('checkIfCountryExists', () => {
    beforeEach(() => {
      countrySpy = jest.spyOn(CountryService, 'findCountry');
      name = 'Kenya';
    });

    it('test when a value is returned by findCountry', async () => {
      countrySpy.mockResolvedValue(countryMock);
      const result = await CountryHelper.checkIfCountryExists(name);
      expect(countrySpy).toHaveBeenCalledWith(name, -1);
      expect(result).not.toBeNull();
    });
    it('test when a null is returned by findCountry', async () => {
      countrySpy.mockResolvedValue(null);
      const result = await CountryHelper.checkIfCountryExists(name);
      expect(countrySpy).toHaveBeenCalledWith(name, -1);
      expect(result).toBeNull();
    });
  });

  describe('validateString', () => {
    const validString = 'Kenya';
    const inValidString = 'Kenya#';
    const isValid = CountryHelper.validateString(validString);
    const isInvalid = CountryHelper.validateString(inValidString);
    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });

  describe('validateIfCountryIsDeleted', async () => {
    const countryName = 'Kenya';
    const findDeletedCountrySpy = jest.spyOn(CountryService, 'findDeletedCountry');
    findDeletedCountrySpy.mockResolvedValue(deletedCountryMock);
    const result = await CountryHelper.validateIfCountryIsDeleted(countryName);
    expect(findDeletedCountrySpy).toHaveBeenCalledWith(countryName);
    expect(result).toEqual(deletedCountryMock);
  });

  describe('checkCountry', () => {
    let findCountrySpy;
    beforeEach(() => {
      jest.resetAllMocks();
      findCountrySpy = jest.spyOn(CountryService, 'findIfCountryIsListedGlobally');
    });

    it('returns false if country does not exist', async () => {
      findCountrySpy.mockResolvedValue(mockError);
      const result = await CountryHelper.checkCountry('Kenya');
      expect(result).toEqual(false);
    });

    it('returns true if country exists', async () => {
      findCountrySpy.mockResolvedValue(countryMock);
      const result = await CountryHelper.checkCountry('Kenya');
      expect(result).toEqual(true);
    });

    it('returns true if API is down', async () => {
      findCountrySpy.mockResolvedValue(mockAPIFail);
      const result = await CountryHelper.checkCountry('Kenya');
      expect(result).toEqual(true);
    });
  });
});

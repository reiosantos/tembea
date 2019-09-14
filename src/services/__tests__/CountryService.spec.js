import request from 'request-promise-native';
import CountryService from '../CountryService';
import models from '../../database/models';
import { mockReturnedCountryData, mockCountryError } from '../__mocks__';
import * as mocked from '../../modules/countries/__mocks__';
import { deletedCountryMock } from '../../helpers/__mocks__/countryHelperMock';

const { Country } = models;

describe('test function GetAllCountries()', () => {
  const findAllCountriesSpy = jest.spyOn(Country, 'findAndCountAll');
  it('should get all countries', async () => {
    findAllCountriesSpy.mockResolvedValue(mocked.mockCountryCreationResponse);
    await CountryService.getAllCountries(1, 1, '');
    expect(findAllCountriesSpy).toHaveBeenCalled();
  });
});

describe('test getCountryByID()', () => {
  it('should get a country by id', async () => {
    const findOneSpy = jest.spyOn(Country, 'findOne')
      .mockResolvedValue(mocked.mockCountryCreationResponse);
    await CountryService.getCountryById(1);
    expect(findOneSpy).toHaveBeenCalled();
  });
});

describe('test findCountryByName', () => {
  it('should find country by name', async () => {
    const findOneSpy = jest.spyOn(Country, 'findOne')
      .mockResolvedValue(mocked.mockCountryCreationResponse);
    const country = await CountryService.findCountry('Kenya');
    expect(findOneSpy).toHaveBeenCalled();
    expect(country).not.toBeNull();
  });
});

describe('test createCountry()', () => {
  it('should create a country with supplied name', async () => {
    const createCountrySpy = jest.spyOn(Country, 'findOrCreate');
    createCountrySpy.mockResolvedValue([mocked.mockReturnedCountryData]);
    const result = await CountryService.createCountry('Kenya');
    expect(createCountrySpy).toHaveBeenCalled();
    expect(result).not.toBeNull();
  });
});

describe('test updateCountryName()', () => {
  it('should update country name', async () => {
    const update = jest.fn(() => {}).mockReturnValue('New Kenya');
    const mockCountry = {
      name: 'New Kenya', status: 'Active', id: 1, update
    };
    const getCountryByIdSpy = jest.spyOn(CountryService, 'getCountryById');
    getCountryByIdSpy.mockResolvedValue(mockCountry);
    const result = await CountryService.updateCountryName(1, 'Kenya');
    expect(result).toEqual(mockCountry);
  });
});
describe('test deleteCountryName', () => {
  it('should delete a country', async () => {
    const save = jest.fn();
    const mockResponse = {
      status: 'active',
      name: 'Kenya',
      id: 1,
      save
    };
    const findOneSpy = jest.spyOn(Country, 'findOne')
      .mockResolvedValue(mockResponse);
    const result = await CountryService.deleteCountryByNameOrId('Kenya');
    expect(findOneSpy).toHaveBeenCalled();
    expect(result).not.toBeNull();
    expect(result).toEqual(true);
  });
});

describe('test findDeletedCountry', () => {
  let countrySpy = {
    scope: jest.fn(() => ({
      findOne: jest.fn()
    }))
  };
  it('should find a country that is deleted and return it', async () => {
    countrySpy = Country;
    jest.spyOn(countrySpy, 'scope');
    jest.spyOn(countrySpy, 'findOne').mockReturnValue(deletedCountryMock);
    const returnedCountry = await CountryService.findDeletedCountry('Kenya');
    expect(countrySpy.scope).toHaveBeenCalledWith('all');
    expect(returnedCountry).toEqual(deletedCountryMock);
  });

  describe('test findIfCountryIsListedGlobally', () => {
    let getSpy;
    beforeEach(() => {
      getSpy = jest.spyOn(request, 'get');
      jest.resetAllMocks();
    });

    it('should return a country that is listed globally', async () => {
      getSpy.mockResolvedValue(mockReturnedCountryData);
      const result = await CountryService.findIfCountryIsListedGlobally('Kenya');
      expect(request.get).toHaveBeenCalled();
      expect(result).toEqual(mockReturnedCountryData);
    });

    it('should return an error object if country was not found', async () => {
      getSpy.mockRejectedValue(mockCountryError);
      const result = await CountryService.findIfCountryIsListedGlobally('abuja');
      expect(request.get).toHaveBeenCalled();
      expect(result).toEqual(mockCountryError);
    });
  });
});

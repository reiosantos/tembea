import CountryController from '../countriesController';
import bugsnagHelper from '../../../helpers/bugsnagHelper';
import HttpError from '../../../helpers/errorHandler';
import CountryService from '../../../services/CountryService';
import * as mocks from '../__mocks__';

describe('CountryController', () => {
  const res = {
    status: () => ({
      json: () => {}
    })
  };
  const err = 'an error';
  jest.spyOn(res, 'status');

  beforeEach(() => {
    jest.spyOn(bugsnagHelper, 'log');
    jest.spyOn(HttpError, 'sendErrorResponse');
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('addCountry()', () => {
    const req = {
      body: { name: 'Kenya' }
    };
    const createCountrySpy = jest.spyOn(CountryService, 'createCountry');

    it('should return errors', async () => {
      createCountrySpy.mockImplementation(() => Promise.reject(new Error(err)));
      await CountryController.addCountry(req, res);
      expect(bugsnagHelper.log).toHaveBeenCalled();
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
    });

    it('should create a country', async () => {
      createCountrySpy.mockResolvedValue(mocks.mockNewCountry);
      await CountryController.addCountry(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return an error if the country exists', async () => {
      createCountrySpy.mockResolvedValue(mocks.mockExistingCountry);
      await CountryController.addCountry(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  describe('updateCountry()', () => {
    const req = {
      body: { name: 'Kenya', newName: 'Uganda' }
    };
    const findCountrySpy = jest.spyOn(CountryService, 'findCountry');
    const updateCountryName = jest.spyOn(CountryService, 'updateCountryName');

    it('should return an error', async () => {
      findCountrySpy.mockImplementation(() => Promise.reject(new Error(err)));
      await CountryController.updateCountry(req, res);
      expect(bugsnagHelper.log).toHaveBeenCalled();
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
    });

    it('should update a country', async () => {
      findCountrySpy.mockReturnValue(req.body.name);
      updateCountryName.mockReturnValue(mocks.mockUpdatedData);
      await CountryController.updateCountry(req, res);
      expect(updateCountryName).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteCountry()', () => {
    const req = { body: { name: 'Kenya' } };
    const deleteCountrySpy = jest.spyOn(CountryService, 'deleteCountryByNameOrId');

    it('should return an error', async () => {
      deleteCountrySpy.mockImplementation(() => Promise.reject(new Error(err)));
      await CountryController.deleteCountry(req, res);
      expect(deleteCountrySpy).toHaveBeenCalled();
      expect(bugsnagHelper.log).toHaveBeenCalled();
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
    });

    it('should delete a country', async () => {
      deleteCountrySpy.mockReturnValue([]);
      await CountryController.deleteCountry(req, res);
      expect(deleteCountrySpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getAllCountries()', () => {
    const req = { query: { page: 1, size: 1, name: '' } };
    const { size, name, page } = req.query;
    const getAllCountriesSpy = jest.spyOn(CountryService, 'getAllCountries');

    it('should return an error', async () => {
      getAllCountriesSpy.mockImplementation(() => Promise.reject(new Error(err)));
      await CountryController.getAllCountries(req, res);
      expect(bugsnagHelper.log).toHaveBeenCalled();
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
    });

    it('should getAllCountries', async () => {
      getAllCountriesSpy.mockReturnValue(mocks.mockCountryDetails);
      await CountryController.getAllCountries(req, res);
      expect(getAllCountriesSpy).toHaveBeenCalledWith(size, page, name);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should throw a http error if there are no rows', async () => {
      getAllCountriesSpy.mockReturnValue(mocks.mockCountryZeroRow);
      await CountryController.getAllCountries(req, res);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
    });
  });
});

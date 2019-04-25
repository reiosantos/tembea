import HttpError from '../../../helpers/errorHandler';
import bugsnagHelper from '../../../helpers/bugsnagHelper';
import HomeBaseController from '../HomebaseController';
import HomebaseService from '../../../services/HomebaseService';
import CountryService from '../../../services/CountryService';
import {
  mockCountry, mockCreatedHomebase, mockExistingHomebase
} from '../../../services/__mocks__';


describe('Test HomebaseController', () => {
  let req;

  const res = {
    status() {
      return this;
    },
    json() {
      return this;
    }
  };
  HttpError.sendErrorResponse = jest.fn();
  bugsnagHelper.log = jest.fn();
  beforeEach(() => {
    jest.spyOn(res, 'status');
    jest.spyOn(res, 'json');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('test addHomebase', () => {
    let homebaseSpy;
    let countrySpy;
    beforeEach(() => {
      req = { body: { countryName: 'Kenya', homebaseName: 'Nairobi' } };
      homebaseSpy = jest.spyOn(HomebaseService, 'createHomebase');
      countrySpy = jest.spyOn(CountryService, 'findCountry');
    });

    it('should create a homebase successfully', async () => {
      countrySpy.mockResolvedValue(mockCountry);
      homebaseSpy.mockResolvedValue(mockCreatedHomebase);
      await HomeBaseController.addHomeBase(req, res);
      expect(homebaseSpy).toHaveBeenCalledWith('Nairobi', 1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Homebase created successfully',
        homeBase: mockCreatedHomebase.homebase
      });
    });

    it('should return a 409 status if homebase exists', async () => {
      countrySpy.mockResolvedValue(mockCountry);
      homebaseSpy.mockResolvedValue(mockExistingHomebase);
      await HomeBaseController.addHomeBase(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('should send a HTTP error response if err', async () => {
      const err = 'validationError: There was a conflict';
      countrySpy.mockResolvedValue(mockCountry);
      homebaseSpy.mockRejectedValue(err);
      await HomeBaseController.addHomeBase(req, res);
      expect(bugsnagHelper.log).toHaveBeenCalledWith(err);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledWith(err, res);
    });
  });
});

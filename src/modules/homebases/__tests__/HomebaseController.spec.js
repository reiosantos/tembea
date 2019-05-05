import HttpError from '../../../helpers/errorHandler';
import bugsnagHelper from '../../../helpers/bugsnagHelper';
import HomeBaseController from '../HomebaseController';
import HomebaseService from '../../../services/HomebaseService';
import CountryService from '../../../services/CountryService';
import {
  mockCountry, mockCreatedHomebase, mockExistingHomebase,
  mockHomebaseResponse, mockGetHomebaseResponse
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

  describe('test getHomebases', () => {
    const newReq = {
      query: {
        page: 1, size: 5
      }
    };
    const { query: { page, size } } = newReq;
    const pageable = { page, size };
    let getHomebaseSpy;
    beforeEach(() => {
      jest.spyOn(HomebaseService, 'getWhereClause');
      getHomebaseSpy = jest.spyOn(HomebaseService, 'getHomebases');
    });

    it('returns a single homebase', async () => {
      const where = {};
      getHomebaseSpy.mockResolvedValue(mockGetHomebaseResponse);
      await HomeBaseController.getHomebases(newReq, res);
      expect(HomebaseService.getWhereClause).toHaveBeenCalledWith(newReq.query);
      expect(HomebaseService.getHomebases).toHaveBeenCalledWith(pageable, where);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '1 of 1 page(s).',
        homebase: mockGetHomebaseResponse.homebases
      });
    });

    it('returns multiple homebases', async () => {
      const where = {};
      const pageMeta = {
        totalPages: 1,
        page: 1,
        totalResults: 2,
        pageSize: 10
      };
      getHomebaseSpy.mockResolvedValue(mockHomebaseResponse);
      await HomeBaseController.getHomebases(newReq, res);
      expect(HomebaseService.getWhereClause).toHaveBeenCalledWith(newReq.query);
      expect(HomebaseService.getHomebases).toHaveBeenCalledWith(pageable, where);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '1 of 1 page(s).',
        pageMeta,
        homebases: mockHomebaseResponse.homebases
      });
    });

    it('should send HTTP errors', async () => {
      getHomebaseSpy.mockRejectedValueOnce('an error');
      await HomeBaseController.getHomebases(newReq, res);
      expect(HttpError.sendErrorResponse).toHaveBeenCalled();
      expect(bugsnagHelper.log).toHaveBeenCalled();
    });
  });
});

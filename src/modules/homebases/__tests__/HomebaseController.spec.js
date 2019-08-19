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
      req = { body: { countryId: 1, homebaseName: 'Nairobi', channel: 'UOP23' } };
      homebaseSpy = jest.spyOn(HomebaseService, 'createHomebase');
      countrySpy = jest.spyOn(CountryService, 'findCountry');
    });

    it('should create a homebase successfully', async () => {
      homebaseSpy.mockResolvedValue(mockCreatedHomebase);
      await HomeBaseController.addHomeBase(req, res);
      expect(homebaseSpy).toHaveBeenCalledWith('Nairobi', 1, 'UOP23');
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

  describe('Update homebase', () => {
    let findCountrySpy;
    let findHomeBase;


    beforeEach(() => {
      req = {
        body: {
          homebaseName: 'Cairo',
          countryName: 'Rwanda',
          channel: 'UIO0ED',
          countryId: 1,
        },
        params: {
          id: 3,
        }
      };

      jest.spyOn(res, 'status');

      findCountrySpy = jest.spyOn(CountryService, 'findCountry');
      findHomeBase = jest.spyOn(HomebaseService, 'getById');
      jest.spyOn(HttpError, 'sendErrorResponse');
    });

    it('should return an error if homebase already  exists ', async () => {
      findCountrySpy.mockImplementation(() => Promise.resolve(
        {
          dataValues: {
            id: 1
          }
        }
      ));

      findHomeBase.mockImplementation(() => Promise.reject());
      await HomeBaseController.update(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Homebase with specified name already exists',
        success: false
      });
    });

    it('should handle successful update of homebase', async () => {
      findCountrySpy.mockImplementation(() => Promise.resolve(
        {
          dataValues: {
            id: 1
          }
        }
      ));

      findHomeBase.mockImplementation(() => Promise.resolve(
        { id: 1, countryId: 1, name: 'Cairo' }
      ));
      const homeBaseResponse = {
        id: 1, countryId: 1, name: 'Cairo'
      };
      jest.spyOn(HomebaseService, 'update').mockResolvedValue(homeBaseResponse);
      await HomeBaseController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        homebase: { ...homeBaseResponse },
        message: 'HomeBase Updated successfully',
        success: true
      });
    });
  });
});

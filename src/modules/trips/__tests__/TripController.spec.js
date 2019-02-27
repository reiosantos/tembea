import * as mocked from './__mocks__';
import TripController from '../TripController';
import tripService from '../../../services/TripService';

describe('TripController', () => {
  const { mockedValue: { routes: trips }, ...rest } = mocked;
  let req;
  beforeEach(() => {
    req = { query: { page: 1 } };
    const mockedData = {
      trips, totalPages: 2, pageNo: 1, totalItems: 1, itemsPerPage: 100
    };
    jest.spyOn(tripService, 'getTrips').mockResolvedValue(mockedData);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('TripController_getTrips', () => {
    it('Should get all trips value', async (done) => {
      const {
        resultValue: { message, success, data: mockedData },
        response: res
      } = rest;
      const data = { ...mockedData, trips };
      await TripController.getTrips(req, res);
      expect(res.status).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.status().json).toHaveBeenCalledWith({
        data,
        message,
        success
      });
      done();
    });
    it('Should throw an error', async () => {
      const { response: res } = rest;
      jest
        .spyOn(tripService, 'getTrips')
        .mockRejectedValue(new Error('dummy error'));
      await TripController.getTrips(req, res);
      expect(res.status).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.status().json).toHaveBeenCalledWith({
        message: 'dummy error',
        success: false
      });
    });
  });
});

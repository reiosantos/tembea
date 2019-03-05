import tripService, { TripService } from '../TripService';
import models from '../../database/models';
import { mockedValue, tripInfo } from '../../modules/trips/__tests__/__mocks__';

const { TripRequest } = models;

describe('TripService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('TripService_sequelizeWhereClauseOption', () => {
    it('should return empty object when trip status and department is not being  passed', () => {
      const filterParams = {};
      const response = TripService.sequelizeWhereClauseOption(filterParams);
      expect(response).toEqual({});
      expect(response).toBeTruthy();
    });

    it('should return trip status when it being  passed', () => {
      const status = 'Pending';
      const filterParams = { status };
      const response = TripService.sequelizeWhereClauseOption(filterParams);
      expect(response).toBeDefined();
      expect(response).toHaveProperty('tripStatus');
      expect(response.tripStatus).toEqual('Pending');
    });

    it('should return trip department when it being passed', () => {
      const department = 'People';
      const filterParams = { department };
      const response = TripService.sequelizeWhereClauseOption(filterParams);
      expect(response).toBeDefined();
      expect(response).toHaveProperty('departmentName');
      expect(response.departmentName).toEqual('People');
    });
  });

  describe('TripService_getTrips', () => {
    beforeEach(() => {
      jest.spyOn(TripRequest, 'findAll').mockResolvedValue([{}]);
      jest.spyOn(TripService, 'serializeTripRequest').mockReturnValue({});
    });
    it('should return trip', async () => {
      const pageable = { page: 1, size: 100 };
      const where = {};
      const response = await tripService.getTrips(pageable, where);
      expect(response).toHaveProperty('trips');
      expect(response).toHaveProperty('totalPages');
      expect(response).toHaveProperty('pageNo');
      expect(response.trips).toEqual([{}]);
    });

    it('should return trips according to search parameter', async () => {
      const pageable = { page: 1, size: 100 };
      const where = { departmentName: 'TDD' };
      const response = await tripService.getTrips(pageable, where);
      expect(response).toHaveProperty('trips');
      expect(response).toHaveProperty('totalPages');
      expect(response).toHaveProperty('pageNo');
      expect(response.trips).toEqual([{}]);
    });
  });

  describe('TripService__serializeUser', () => {
    it('should return the user name, email and slackId', () => {
      const { routes: [{ requester }] } = mockedValue;
      const response = TripService.serializeUser(requester);
      expect(response).toEqual(requester);
      expect(response).toHaveProperty('name');
      expect(response).toHaveProperty('email');
      expect(response).toHaveProperty('slackId');
    });
    it('should return undefined when there is no requester ', () => {
      const response = TripService.serializeUser();
      expect(response).toBeUndefined();
      expect(response).toBeFalsy();
    });
  });

  describe('TripService__serializeAddress', () => {
    it('should return address', () => {
      const address = { dataValues: { address: 'the dojo' } };
      const response = TripService.serializeAddress(address);
      expect(response).toEqual('the dojo');
      expect(response).toBeDefined();
    });
    it('should return undefined when there is no address ', () => {
      const response = TripService.serializeAddress();
      expect(response).toBeUndefined();
      expect(response).toBeFalsy();
    });
  });
  describe('TripService__serializeDepartment', () => {
    it('should return department', () => {
      const department = { dataValues: { name: 'TDD' } };
      const response = TripService.serializeDepartment(department);
      expect(response).toEqual('TDD');
      expect(response).toBeDefined();
    });
    it('should return undefined when there is no department ', () => {
      const response = TripService.serializeDepartment();
      expect(response).toBeUndefined();
      expect(response).toBeFalsy();
    });
  });
  describe('TripService__serializeTripRequest', () => {
    it('should return all valid trips property', () => {
      const trip = { ...mockedValue, ...tripInfo };
      const response = TripService.serializeTripRequest(trip);
      expect(response).toBeDefined();
      expect(response).toHaveProperty('name');
      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('arrivalTime');
      expect(response).toHaveProperty('type');
      expect(response).toHaveProperty('passenger');
      expect(response).toHaveProperty('departureTime');
      expect(response).toHaveProperty('requestedOn');
      expect(response).toHaveProperty('department');
      expect(response).toHaveProperty('destination');
      expect(response).toHaveProperty('decliner');
      expect(response).toHaveProperty('rider');
      expect(response).toHaveProperty('pickup');
      expect(response).toHaveProperty('requester');
      expect(response).toHaveProperty('approvedBy');
      expect(response).toHaveProperty('confirmedBy');
    });
  });

  describe('checkExistence', () => {
    it('should return true if trip exists', async () => {
      jest.spyOn(TripRequest, 'count').mockResolvedValue(true);
      const result = await TripService.checkExistence(1);
      expect(TripRequest.count).toBeCalledTimes(1);
      expect(result).toBe(true);
    });

    it('should return false if trip does not exist', async () => {
      jest.spyOn(TripRequest, 'count').mockResolvedValue(false);
      const result = await TripService.checkExistence(3);
      expect(TripRequest.count).toBeCalledTimes(1);
      expect(result).toBe(false);
    });
  });
});

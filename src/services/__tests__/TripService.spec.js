import tripService, { TripService } from '../TripService';
import models from '../../database/models';
import {
  mockedValue, tripInfo, mockTrip, updatedValue, mockAirportTransferTrip, providerMock
} from '../../modules/trips/__tests__/__mocks__';
import cache from '../../cache';
import RemoveDataValues from '../../helpers/removeDataValues';
import TravelTripService from '../TravelTripService';

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

    it('should return trip department when it being passed', () => {
      const department = 'People';
      const filterParams = { department, dateFrom: '2018-01-11', dateTo: '2019-10-10' };
      const response = TripService.sequelizeWhereClauseOption(filterParams);
      expect(response).toBeDefined();
      expect(response).toHaveProperty('departmentName');
      expect(response.departmentName).toEqual('People');
    });
  });

  it('should return trip type when it is passed', () => {
    const type = 'Embassy Visit';
    const filterParams = { type };
    const response = TripService.sequelizeWhereClauseOption(filterParams);
    expect(response).toHaveProperty('tripType');
    expect(response.tripType).toEqual('Embassy Visit');
  });

  it('should return currentDay when it is passed', () => {
    const currentDay = 'This day';
    const filterParams = { currentDay };
    const response = TripService.sequelizeWhereClauseOption(filterParams);
    expect(response).toHaveProperty('departureTime');
  });

  describe('TripService_getTrips', () => {
    beforeEach(() => {
      jest.spyOn(TripRequest, 'findAll').mockResolvedValue([{}]);
      jest.spyOn(TripService, 'serializeTripRequest').mockReturnValue({});
    });
    it('should return trip', async () => {
      const pageable = { page: 1, size: 100 };
      const where = { homebaseId: 5 };
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
      const address = { address: 'the dojo' };
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
      const department = { name: 'TDD' };
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
  describe('TripService__serializeFlightNumber', () => {
    it('should return flight number', () => {
      const response = TripService.serializeFlightNumber(mockAirportTransferTrip);
      expect(response).toEqual(mockAirportTransferTrip.tripDetail.flightNumber);
    });
    it('should return a placeholder if no trip details exist', () => {
      const response = TripService.serializeFlightNumber({
        ...mockAirportTransferTrip,
        tripDetail: undefined,
      });
      expect(response).toEqual('-');
    });
    it('should return a placeholder if flight number was not provided', () => {
      const response = TripService.serializeFlightNumber({
        ...mockAirportTransferTrip,
        tripDetail: { flightNumber: null }
      });
      expect(response).toEqual('-');
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
      expect(response).toHaveProperty('rating');
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
      expect(response).toHaveProperty('provider');
      expect(response).toHaveProperty('approvalDate');
      expect(response).toHaveProperty('homebase');
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

  describe('TripService_getById', () => {
    beforeAll(() => {
      cache.saveObject = jest.fn(() => { });
      cache.fetch = jest.fn((pk) => {
        if (pk === 'tripDetail_2') {
          return { trip: mockTrip };
        }
      });
    });
    it('should return a single trip from the database', async () => {
      jest.spyOn(TripRequest, 'findByPk').mockResolvedValue({ dataValues: mockTrip });
      const result = await tripService.getById(3);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('trip');
    });

    it('should get trip details from cache', async () => {
      const result = await tripService.getById(2);
      expect(result).toEqual({ trip: mockTrip });
    });
    it('should throw an error', async () => {
      try {
        await tripService.getById({});
      } catch (error) {
        expect(error.message).toBe('Could not return the requested trip');
      }
    });
  });
  describe('tripService_getAll', () => {
    it('should return all trips', async () => {
      jest.spyOn(TripRequest, 'findAll').mockResolvedValue(mockedValue);
      await tripService.getAll({ where: { tripStatus: 'Pending' } });
      expect(TripRequest.findAll).toBeCalled();
    });
  });
  describe('tripService_updateRequest', () => {
    it('should update a trip request', async () => {
      jest.spyOn(TripRequest, 'update').mockResolvedValue(updatedValue);
      jest.spyOn(tripService, 'getById').mockResolvedValue(updatedValue);
      jest.spyOn(RemoveDataValues, 'removeDataValues').mockReturnValue(
        mockedValue
      );
      await tripService.updateRequest(1,
        { tripStatus: 'Confirmed' });
      expect(TripRequest.update).toBeCalled();
    });
    it('should throw an error when trip request update fails', async () => {
      const err = new Error('Error updating trip request');

      jest.spyOn(TripRequest, 'update').mockRejectedValue(new Error());
      try {
        await tripService.updateRequest(1,
          { tripStatus: 'Confirmed' });
      } catch (error) {
        expect(error).toEqual(err);
      }
    });
  });
  describe('tripService_serializeProviderData', () => {
    it('should return a serialized provider', () => {
      const serializedProvider = TripService.serializeProviderData(providerMock);
      expect(serializedProvider).toEqual({
        name: 'Provider Test Name',
        email: 'provider_email@email.com',
        phoneNumber: '08001111111'
      });
    });

    it('should return a serialized provider', () => {
      const newProviderMock = {
        ...providerMock,
        user: {
          ...providerMock.user,
          phoneNo: undefined
        }
      };
      const serializedProvider = TripService.serializeProviderData(newProviderMock);
      expect(serializedProvider).toEqual({
        name: 'Provider Test Name',
        email: 'provider_email@email.com',
        phoneNumber: '-'
      });
    });
  });

  describe('tripService_getCompletedTravelTrips', () => {
    it('should return an empty list of travel trips if none ', async () => {
      const result = await TravelTripService.getCompletedTravelTrips(null, null, []);
      expect(result).toEqual([]);
    });

    it('should return a list of travel trips if any ', async () => {
      const result = await TravelTripService.getCompletedTravelTrips('2016-12-03', '2019-07-03',
        [
          'D0 Programs',
          'Technology',
        ]);
      expect(result).toEqual([]);
      const mockedTravelTrips = [
        {
          departmentId: 3,
          departmentName: 'People',
          tripsCount: '1',
          averageRating: '4.0000000000000000',
          totalCost: '14'
        }
      ];

      jest.spyOn(TripRequest, 'findAll').mockResolvedValue(mockedTravelTrips);
      const result2 = await TravelTripService.getCompletedTravelTrips('2019-12-03', '2018-07-03', [
        'D0 Programs',
        'Technology',
      ]);
      expect(result2).toEqual(mockedTravelTrips);

      expect(TripRequest.findAll).toBeCalled();
    });
  });
});

import TripHelper from './TripHelper';
import Cache from '../cache';
import AddressService from '../services/AddressService';
import { tripRequestDetails } from
  '../modules/slack/SlackInteractions/__mocks__/SlackInteractions.mock';

describe('TripHelper', () => {
  it('should validate ', () => {
    let result = TripHelper.cleanDateQueryParam(
      { departureTime: 'after:2018-10-10;before:2018-01-10' }, 'departureTime'
    );
    expect(result).toEqual({ after: '2018-10-10', before: '2018-01-10' });

    result = TripHelper.cleanDateQueryParam(
      { departureTime: 'after:2018-10-10' }, 'departureTime'
    );

    expect(result).toEqual({ after: '2018-10-10' });

    result = TripHelper.cleanDateQueryParam(
      { departureTime: 'before:2018-01-10' }, 'departureTime'
    );
    expect(result)
      .toEqual({
        before: '2018-01-10'
      });

    result = TripHelper.cleanDateQueryParam(
      { departureTime: 'before' }, 'departureTime'
    );
    expect(result)
      .toEqual({
        before: undefined
      });

    result = TripHelper.cleanDateQueryParam(
      { departureTime: 'besfore:121212;afefd:1212122' }, 'usefc'
    );
    expect(result)
      .toEqual(undefined);
  });

  describe('#tripHasProvider', () => {
    it('should return true', () => {
      const tripHasProvider = TripHelper.tripHasProvider(tripRequestDetails);
      expect(tripHasProvider).toEqual(true);
    });

    it('should return false', () => {
      const trip = { providerId: null };
      const tripHasProvider = TripHelper.tripHasProvider(trip);
      expect(tripHasProvider).toEqual(false);
    });
  });
});

describe('TripHelper for Schedule Trip', () => {
  const userTripData = {
    department: { value: '1' }
  };
  const location = {
    location: {
      id: 2,
      longitude: 1.2222,
      latitude: 56.5555
    }
  };
  beforeEach(() => {
    jest.spyOn(AddressService, 'findCoordinatesByAddress').mockImplementation((address) => {
      if (address === 'pickup' || address === 'dummy') {
        return location;
      }
      return null;
    });
    jest.spyOn(Cache, 'saveObject').mockResolvedValue({});
    jest.spyOn(Cache, 'fetch').mockResolvedValue(userTripData);
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  it('should update the trip data and save in cache - updateTripData', async () => {
    const result = await TripHelper
      .updateTripData('1', 'dummy', 'pickup', 'othersPickup', '2018-10-10');
    expect(result.pickupLat).toBe(56.5555);
    expect(result.pickupLong).toBe(1.2222);
  });

  it('should return coordinates for preset destination - "getDestinationCoordinates"', async () => {
    const tripDetails = tripRequestDetails();
    const result = await TripHelper
      .getDestinationCoordinates('dummy', tripDetails);
    expect(result).toHaveProperty('destinationLat');
    expect(result).toHaveProperty('destinationLong');
    expect(result.destinationLat).toBe(56.5555);
  });

  it('should not save pickup coords if "Others" is selected  - "updateTripData"', async () => {
    const tripDetail = {
      pickup: 'Others',
      othersPickup: 'others_pickup',
      date_time: '10/10/2018 22:00',
      department: {
        value: 1
      }
    };
    jest.spyOn(Cache, 'fetch').mockResolvedValue(tripDetail);
    const result = await TripHelper
      .updateTripData('1', 'dummy', 'Others', 'othersPickup', '2018-10-10');
    expect(result.departmentId).toEqual(1);
    expect(result.tripType).toEqual('Regular Trip');
    expect(result.pickupId).toBeUndefined();
  });

  it('should return tripDetail without destinationLat  - "getDestinationCoordinates"', async () => {
    const tripDetails = tripRequestDetails();
    const result = await TripHelper
      .getDestinationCoordinates('Others', tripDetails);
    expect(result.destinationLat).toBeUndefined();
  });
});

describe('Trip approval Date test', () => {
  it('should return a new trip approval date format', () => {
    const timeStamp = 1564005209482;
    const newApprovalDateFormat = TripHelper.convertApprovalDateFormat(timeStamp);
    const [date] = newApprovalDateFormat.split('T');
    expect(date).toEqual('2019-07-24');
  });
});

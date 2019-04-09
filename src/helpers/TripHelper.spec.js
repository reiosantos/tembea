import TripHelper from './TripHelper';
import Cache from '../cache';
import AddressService from '../services/AddressService';

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
});

describe('TripHelper for Schedule Trip', () => {
  const userTripData = {
    department: { value: '1' }
  };
  const userTripData2 = {
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
    jest.spyOn(Cache, 'save').mockResolvedValue({});
    jest.spyOn(Cache, 'fetch').mockResolvedValue(userTripData);
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  it('should update the trip data and save in cache - "updateTripData"', async () => {
    const result = await TripHelper
      .updateTripData('1', 'dummy', 'pickup', 'othersPickup', '2018-10-10');
    expect(Cache.save).toHaveBeenCalledWith('1', 'tripDetails', userTripData);
    expect(result).toBeUndefined();
  });
  it('should return coordinates for preset destination - "getDestinationCoordinates"', async () => {
    const result = await TripHelper
      .getDestinationCoordinates('dummy');
    expect(result).toHaveProperty('location');
    expect(result).toBe(location);
  });
  it('should not save pickup coords if "Others" is selected  - "updateTripData"', async () => {
    jest.spyOn(Cache, 'fetch').mockResolvedValue(userTripData2);
    await TripHelper
      .updateTripData('1', 'dummy', 'Others', 'othersPickup', '2018-10-10');
    expect(userTripData2.pickupId).toBeUndefined();
  });

  it('should return null for other destination  - "getDestinationCoordinates"', async () => {
    const result = await TripHelper
      .getDestinationCoordinates('Others');
    expect(result).toBe(null);
  });
});

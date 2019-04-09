import PreviewScheduleTrip from '../previewScheduleTripAttachments';
import { createTripData } from '../../../SlackInteractions/__mocks__/SlackInteractions.mock';
import { SlackHelpers, GoogleMapsDistanceMatrix } from '../../../RouteManagement/rootFile';

describe('PreviewScheduleTripAttachments', () => {
  const tripDetails = createTripData();
  beforeEach(() => {
    jest.spyOn(SlackHelpers, 'findUserByIdOrSlackId')
      .mockResolvedValue({ name: 'dummyData' });
    jest.spyOn(PreviewScheduleTrip, 'getDistance')
      .mockImplementation((plat, plng, desCoords) => {
        if (desCoords.location && plat && plng) return '5km';
        if (desCoords.destinationLat && plat && plng) return '5km';
        if (typeof desCoords !== 'object') return null;
        return null;
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should preview a user schedule trip if location is confirmed on map', async () => {
    const result = await PreviewScheduleTrip.previewScheduleTripAttachments(tripDetails);
    expect(result.length).toBe(9);
  });

  it('should preview a user schedule trip if othersDestination is selected', async () => {
    jest.spyOn(PreviewScheduleTrip, 'saveDistance').mockImplementation((a, b) => [a, b]);
    tripDetails.forSelf = 'true';
    tripDetails.othersDestination = 'Lagos';
    const result = await PreviewScheduleTrip.previewScheduleTripAttachments(tripDetails);
    expect(result.length).toBe(9);
    expect(PreviewScheduleTrip.saveDistance).toHaveBeenCalledWith(tripDetails, expect.any(String));
    jest.restoreAllMocks();
  });

  it('should preview "someone" schedule trip if location is confirmed on map', async () => {
    tripDetails.forSelf = 'false';
    jest.spyOn(PreviewScheduleTrip, 'getRider')
      .mockResolvedValue({
        name: 'dummyData'
      });
    const result = await PreviewScheduleTrip.previewScheduleTripAttachments(tripDetails);
    expect(result.length).toBe(9);
  });

  it('should preview a user schedule trip if othersDestination is selected and there are no coords',
    async () => {
      tripDetails.forSelf = 'true';
      tripDetails.othersDestination = 'Lagos';
      delete tripDetails.destinationLat;
      delete tripDetails.pickupLat;
      const result = await PreviewScheduleTrip.previewScheduleTripAttachments(tripDetails);
      expect(result.length).toBe(8);
    });

  it('should preview a user schedule trip if location is not confirmed on map', async () => {
    const tripDetails3 = createTripData();
    tripDetails.forSelf = 'true';
    const userDetails = {
      passengerName: 'dummy',
      passengers: '1',
      userName: 'dummy6',
      pickup: 'pickup',
      destination: 'destination',
      dateTime: '12:00',
      department: 'tdd',
      reason: 'dd'
    };
    delete tripDetails3.othersDestination;
    const { pickupLat, pickupLong, destinationCoords } = tripDetails3;
    const result = await PreviewScheduleTrip
      .previewScheduleTripForKnownLocations(pickupLat, pickupLong, destinationCoords,
        { userDetails, tripData: tripDetails3 });
    expect(result.length).toBe(9);
  });

  it('should not preview distance if distance is "unknown"', async () => {
    tripDetails.forSelf = 'true';
    jest.spyOn(PreviewScheduleTrip, 'getDistance')
      .mockResolvedValue('unknown');
    delete tripDetails.destinationLat;
    delete tripDetails.pickupLat;
    const result = await PreviewScheduleTrip.previewScheduleTripAttachments(tripDetails);
    expect(result).toBeDefined();
    expect(result.length).toBe(8);
  });
});

describe('getRiders', () => {
  it('should return a rider\'s name if ID is found', async () => {
    jest.spyOn(SlackHelpers, 'findUserByIdOrSlackId')
      .mockResolvedValue({
        name: 'dummyData'
      });
    const result = await PreviewScheduleTrip.getRider(4);
    expect(result).toBeDefined();
    expect(result.name).toBe('dummyData');
    jest.resetAllMocks();
  });
  it('should return a "" if ID is not found', async () => {
    const result = await PreviewScheduleTrip.getRider(40);
    jest.spyOn(SlackHelpers, 'findUserByIdOrSlackId')
      .mockResolvedValue({
        name: ''
      });
    expect(result).toBeDefined();
    expect(result.name).toBe('');
  });
});

describe('PreviewScheduleTripAttachments.calculateDistance', () => {
  const destCoords = {
    location: {
      longitude: 3.33333,
      latitude: 5.5555,
    }
  };
  beforeEach(() => {
    jest.spyOn(GoogleMapsDistanceMatrix, 'calculateDistance')
      .mockResolvedValue({ distanceInKm: '5km' });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  it('should get the calculated driving distance', async () => {
    const result = await PreviewScheduleTrip.getDistance(1, 1, destCoords);
    expect(result).toBeDefined();
    expect(result).toBe('5km');
  });
  it('should get the calculated driving distance if selected from Google maps', async () => {
    const destCoords2 = {
      destinationLat: 1.1111,
      destinationLong: 2.3333
    };
    const result = await PreviewScheduleTrip.getDistance(1, 1, destCoords2);
    expect(result).toBeDefined();
    expect(result).toBe('5km');
  });
});

import PreviewScheduleTrip from '../previewScheduleTripAttachments';
import { createTripData } from '../../../SlackInteractions/__mocks__/SlackInteractions.mock';
import { SlackHelpers, GoogleMapsDistanceMatrix } from '../../../RouteManagement/rootFile';

describe('PreviewScheduleTripAttachments', () => {
  const tripDetails = createTripData();
  beforeEach(() => {
    jest.spyOn(SlackHelpers, 'findUserByIdOrSlackId')
      .mockResolvedValue({ name: 'dummyData' });
    jest.spyOn(GoogleMapsDistanceMatrix, 'calculateDistance')
      .mockResolvedValue({ distanceKm: '5' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should preview a user schedule trip if location is confirmed on map', async () => {
    const result = await PreviewScheduleTrip.previewScheduleTripAttachments(tripDetails);
    expect(result.length).toBe(9);
  });
  it('should preview "someone" schedule trip if location is confirmed on map', async () => {
    tripDetails.forSelf = 'false';
    jest.spyOn(PreviewScheduleTrip, 'getRider')
      .mockResolvedValue({ name: 'dummyData' });
    const result = await PreviewScheduleTrip.previewScheduleTripAttachments(tripDetails);
    expect(result.length).toBe(9);
  });
  it('should preview a user schedule trip if location is not confirmed on map', async () => {
    tripDetails.forSelf = 'true';
    delete tripDetails.destinationLat;
    delete tripDetails.pickupLat;
    const result = await PreviewScheduleTrip.previewScheduleTripAttachments(tripDetails);
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

import PreviewTripBooking from './preview-trip-booking-helper';
import {
  GoogleMapsDistanceMatrix, Cache
} from '../../../slack/RouteManagement/rootFile';
import { userTripDetails } from './user-data-mocks';
import PreviewScheduleTrip
  from '../../../slack/helpers/slackHelpers/previewScheduleTripAttachments';


describe('PreviewTripBooking', () => {
  const riderId = 'HJYU67H';

  beforeEach(() => {
    jest.spyOn(GoogleMapsDistanceMatrix, 'calculateDistance')
      .mockResolvedValue({ distanceInKm: '10 Km' });
    jest.spyOn(Cache, 'save').mockResolvedValue();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('getRiderName', () => {
    it('should return the name of the rider', async () => {
      jest.spyOn(PreviewScheduleTrip, 'getRider').mockResolvedValue({
        name: 'rider', id: riderId
      });
      const riderName = await PreviewTripBooking.getRiderName(riderId);
      expect(riderName).toEqual('rider');
    });
  });

  describe('previewDistance', () => {
    it('should get a slack text for the distance', () => {
      const expected = [{
        type: 'mrkdwn',
        text: '*Distance* \n10 Km'
      }];
      const preview = PreviewTripBooking.previewDistance('10 Km', []);
      expect(preview).toEqual(expected);
    });

    it('should not get a slack text for the distance when distance is unknown', () => {
      const preview = PreviewTripBooking.previewDistance('unknown', []);
      expect(preview).toEqual([]);
    });
  });

  describe('getpreviewFields', () => {
    it('should return trip preview with latitude and longitude', async () => {
      const preview = await PreviewTripBooking.getPreviewFields(userTripDetails);
      expect(preview).toBeDefined();
      expect(Cache.save).toHaveBeenCalled();
      expect(GoogleMapsDistanceMatrix.calculateDistance).toHaveBeenCalled();
    });

    it('should return trip preview when latitude and longitude is null', async () => {
      userTripDetails.pickupLat = null;
      const preview = await PreviewTripBooking.getPreviewFields(userTripDetails);
      expect(preview).toBeDefined();
    });

    it('should return preview when forMe id false', async () => {
      jest.spyOn(PreviewTripBooking, 'getRiderName').mockResolvedValue('Patrick');
      userTripDetails.forMe = false;
      const preview = await PreviewTripBooking.getPreviewFields(userTripDetails);
      expect(preview).toBeDefined();
    });
  });
});

import NewSlackHelpers from '../../helpers/slack-helpers';
import PreviewTripBooking from './preview-trip-booking-helper';
import { GoogleMapsDistanceMatrix, Cache } from '../../../slack/RouteManagement/rootFile';
import { userTripDetails } from './user-data-mocks';


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
  describe('getRider', () => {
    it('should get rider', async () => {
      jest.spyOn(NewSlackHelpers, 'findUserByIdOrSlackId')
        .mockResolvedValue({ name: 'rider', id: riderId });
      const rider = await PreviewTripBooking.getRider(riderId);
      expect(rider).toBeDefined();
      expect(rider.id).toEqual(riderId);
    });
  
    it('should not get rider', async () => {
      jest.spyOn(NewSlackHelpers, 'findUserByIdOrSlackId').mockResolvedValue();
      const rider = await PreviewTripBooking.getRider(riderId);
      expect(rider.name).toEqual('');
      expect(rider.id).toBeUndefined();
    });

    it('should return undefined', async () => {
      const rider = await PreviewTripBooking.getRider();
      expect(rider).toBeUndefined();
    });
  });

  describe('formatName', () => {
    it('should format a name', () => {
      const formatedName = PreviewTripBooking.formatName('joe.gomez');
      expect(formatedName).toEqual('Joe Gomez');
    });

    it('should return undefined when name is not a string', () => {
      const formatedName = PreviewTripBooking.formatName(7);
      expect(formatedName).toBeUndefined();
    });
  });

  describe('getRiderName', () => {
    it('should return the name of the rider', async () => {
      jest.spyOn(PreviewTripBooking, 'getRider').mockResolvedValue({
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

  describe('getDistance', () => {
    it('should get distance in Kms', async () => {
      const [pickup, destination] = [{
        longitude: -8.888999,
        latitude: 6.900999
      }, {
        longitude: 9.455556,
        latitude: -4.76666
      }];
      const distance = await PreviewTripBooking
        .getDistance(pickup.latitude, pickup.longitude, destination.latitude, destination.longitude);
      expect(distance).toBeDefined();
      expect(distance).toEqual('10 Km');
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

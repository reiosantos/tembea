import UserTripHelpers from './user-trip-helpers';
import { Cache, AddressService } from '../../../slack/RouteManagement/rootFile';
import { getTripKey } from '../../../../helpers/slack/ScheduleTripInputHandlers';
import { userTripDetails } from './user-data-mocks';
import GoogleMapsReverseGeocode from '../../../../services/googleMaps/GoogleMapsReverseGeocode';
import NewLocationHelpers, { getPredictionsKey } from '../../helpers/location-helpers';
import tripService from '../../../../services/TripService';
import NewSlackHelpers from '../../helpers/slack-helpers';
import PreviewScheduleTrip
  from '../../../slack/helpers/slackHelpers/previewScheduleTripAttachments';

describe('UserTripHelpers', () => {
  const testUser = { id: 'U1479' };

  beforeEach(() => {
    jest.spyOn(AddressService, 'findCoordinatesByAddress').mockResolvedValue({
      location: {
        longitude: 1.9403,
        latitude: 29.8739,
        id: '32YUODSDK89889'
      }
    });
    jest.spyOn(PreviewScheduleTrip, 'getDistance').mockResolvedValue('10 Km');
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  describe('handlePickupDetails', () => {
    let cacheSpy;

    beforeEach(() => {
      jest.spyOn(UserTripHelpers, 'updateTripData')
        .mockImplementation((userId, d) => ({
          id: userId,
          pickup: d.pickup,
          othersPickup: d.othersPickup,
          dateTime: d.dateTime,
          departmentId: 5
        }));

      cacheSpy = jest.spyOn(Cache, 'saveObject').mockResolvedValue();
    });

    it('should update the trip data and save to cache', async () => {
      const data = {
        dateTime: new Date(2019, 6, 31, 23, 55).toISOString(),
        pickup: 'Test Location'
      };
      await UserTripHelpers.handlePickUpDetails(testUser, data);

      expect(cacheSpy).toHaveBeenCalledWith(getTripKey(testUser.id), expect.objectContaining(data));
    });
  });

  describe('updateTripData', () => {
    beforeEach(() => {
      jest.spyOn(Cache, 'fetch').mockResolvedValue(userTripDetails);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should update trip data when pickup is not others', async () => {
      const submission = {
        pickup: 'kigali',
        othersPickup: null,
        dateTime: '22/12/2019 22:00'
      };
      const updateTripData = await UserTripHelpers.updateTripData(testUser, submission);
      expect(updateTripData).toBeDefined();
      expect(Cache.fetch).toHaveBeenCalledWith(getTripKey(testUser.id));
      expect(AddressService.findCoordinatesByAddress).toHaveBeenCalledWith(submission.pickup);
    });

    it('should update trip data when pickup is others', async () => {
      const submission = {
        pickup: 'Others',
        othersPickup: 'Nairobi',
        dateTime: '22/12/2019 22:00'
      };
      const updateTripData = await UserTripHelpers.updateTripData(testUser, submission);
      expect(updateTripData).toBeDefined();
      expect(Cache.fetch).toHaveBeenCalledWith(getTripKey(testUser.id));
    });
  });

  describe('handleLocationVerfication', () => {
    beforeEach(() => {
      jest.spyOn(UserTripHelpers, 'getCachedPlaceIds').mockResolvedValue({ location: 'kigali' });
      jest.spyOn(Cache, 'fetch').mockResolvedValue(userTripDetails);
      jest.spyOn(Cache, 'saveObject').mockResolvedValue();
      jest.spyOn(GoogleMapsReverseGeocode, 'getAddressDetails').mockResolvedValue({
        results: [{
          geometry: {
            location: {
              lat: -45.5445,
              lng: 7.322323
            }
          }
        }]
      });
    });

    it('should verify location and send post pickup verfication message', async () => {
      await UserTripHelpers.handleLocationVerfication(testUser, 'Kigali', 'pickup');
      expect(Cache.fetch).toHaveBeenCalledWith(getTripKey(testUser.id));
      expect(Cache.saveObject).toHaveBeenCalled();
    });

    it('should verify location and send post destination verfication message', async () => {
      await UserTripHelpers.handleLocationVerfication(testUser, 'Kigali', 'destination');
      expect(Cache.fetch).toHaveBeenCalledWith(getTripKey(testUser.id));
      expect(Cache.saveObject).toHaveBeenCalled();
    });
  });

  describe('getCachedPlaceIds', () => {
    it('should return place ids and location', async () => {
      jest.spyOn(Cache, 'fetch').mockResolvedValue({ location: 'Nairobi', id: 45 });
      const placeId = await UserTripHelpers.getCachedPlaceIds(testUser.id);
      expect(placeId).toEqual({ location: 'Nairobi', id: 45 });
      expect(Cache.fetch).toHaveBeenCalledWith(getPredictionsKey(testUser.id));
    });
  });

  describe('getPostForMeMessage', () => {
    it('should return post forMe message when forMe is true', async () => {
      jest.spyOn(Cache, 'fetch').mockResolvedValue({ forMe: true });
      const message = await UserTripHelpers.getPostForMeMessage(testUser.id);
      expect(message).toBeDefined();
    });

    it('should return post forMe message when forMe is false', async () => {
      jest.spyOn(Cache, 'fetch').mockResolvedValue({ forMe: false });
      const message = await UserTripHelpers.getPostForMeMessage(testUser.id);
      expect(message).toBeDefined();
    });
  });

  describe('getLocationVerificationMsg', () => {
    it('should get location verification message', async () => {
      jest.spyOn(NewLocationHelpers, 'getLocationVerificationMsg').mockResolvedValue();
      await UserTripHelpers
        .getLocationVerificationMsg('location', testUser.id, 'selectActionId', 'backActionValue');
      
      expect(NewLocationHelpers.getLocationVerificationMsg).toHaveBeenCalled();
    });
  });

  describe('user savePayment helper', () => {
    const payload = {
      submission: { price: '200' },
      state: '{"tripId":"16"}'
    };

    it('save payment', async () => {
      jest.spyOn(NewSlackHelpers, 'dialogValidator').mockResolvedValue();
      jest.spyOn(tripService, 'updateRequest').mockResolvedValue();
  
      await UserTripHelpers.savePayment(payload);
  
      expect(NewSlackHelpers.dialogValidator).toHaveBeenCalled();
      expect(tripService.updateRequest).toHaveBeenCalled();
    });
  });
});

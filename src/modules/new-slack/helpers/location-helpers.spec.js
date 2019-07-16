import LocationHelpers from '../../../helpers/googleMaps/locationsMapHelpers';
import { Cache, AddressService } from '../../slack/RouteManagement/rootFile';
import NewLocationHelpers from './location-helpers';
import { getTripKey } from '../../../helpers/slack/ScheduleTripInputHandlers';

describe('getLocationVerificationMsg', () => {
  it('should get verfication message', async () => {
    const details = {
      url: 'fakeUrl',
      predictions: [{
        description: 'fakeDescription',
        place_id: 'fakeId'
      }]
    };
    jest.spyOn(LocationHelpers, 'getPredictionsOnMap').mockResolvedValue(details);
    jest.spyOn(Cache, 'saveObject').mockResolvedValue(true);
    await NewLocationHelpers.getLocationVerificationMsg('kigali', 'id', 'options');
    expect(LocationHelpers.getPredictionsOnMap).toHaveBeenCalled();
  });

  it('should not return verfication message', async () => {
    jest.spyOn(LocationHelpers, 'getPredictionsOnMap').mockResolvedValue(false);
    expect(await NewLocationHelpers.getLocationVerificationMsg('kigali', 'id', 'options'))
      .toBeFalsy();
  });
});

describe('getDestinationCoordinates', () => {
  const testUser = { id: 'U1479' };

  beforeEach(() => {
    jest.spyOn(Cache, 'fetch').mockResolvedValue();
  });

  it('should return destination coordinates when given destination name', async () => {
    const submission = {
      destination: 'somewhere',
      othersDestination: null
    };
    jest.spyOn(NewLocationHelpers, 'getCoordinates').mockImplementation(loc => (
      loc !== 'Others'
        ? {
          location: {
            longitude: 1,
            latitude: 2,
            id: 3
          }
        } : null
    ));
    const tripDetails = await NewLocationHelpers.getDestinationCoordinates(testUser.id, submission);
    expect(Cache.fetch).toHaveBeenCalledWith(getTripKey(testUser.id));
    expect(tripDetails.destinationLat).toBeDefined();
  });

  it('should return destination only if the destination is others', async () => {
    const submission = {
      destination: 'Others',
      othersDestination: 'Kigali'
    };
    const tripDetails = await NewLocationHelpers.getDestinationCoordinates(testUser.id, submission);
    expect(Cache.fetch).toHaveBeenCalledWith(getTripKey(testUser.id));
    expect(tripDetails.destinationLat).toBeUndefined();
  });
});

import Axios from 'axios';
import GoogleMapsDistanceMatrix from '../GoogleMapsDistanceMatrix';
import { calculateDistanceMock, noGoogleKeysMock } from '../__mocks__';

describe('Calculate distance test', () => {
  it('should be calculate the distance between two addresses', async () => {
    Axios.get = jest.fn(() => (calculateDistanceMock));

    const result = await GoogleMapsDistanceMatrix.calculateDistance('lagos', 'kenya');
    expect(result).toEqual({ distanceInKm: 'boy', distanceInMetres: 'girl' });
  });

  it('should not break the app if no key is provided', async () => {
    Axios.get = jest.fn(() => (noGoogleKeysMock));

    const result = await GoogleMapsDistanceMatrix.calculateDistance('3', '5');
    expect(result).toEqual({ distanceInKm: 'unknown', distanceInMetres: 'unknown' });
  });


  it('should return error when trying to get the distance between two addresses', async () => {
    const errorMessage = new Error('failed');
    Axios.get = jest.fn().mockRejectedValue(errorMessage);

    try {
      await GoogleMapsDistanceMatrix.calculateDistance('lagos', 'kenya');
    } catch (error) {
      expect(error).toEqual(errorMessage);
    }
  });
});

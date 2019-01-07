import Axios from 'axios';
import GoogleMapsDistanceMatrix from '../GoogleMapsDistanceMatrix';
import { calculateDistanceMock } from '../__mocks__';

describe('Calculate distance test', () => {
  it('should be calculate the distance between two addresses', async () => {
    Axios.get = jest.fn(() => (calculateDistanceMock));

    const result = await GoogleMapsDistanceMatrix.calculateDistance('lagos', 'kenya');
    expect(result).toEqual({ distanceInKm: 'boy', distanceInMetres: 'girl' });
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

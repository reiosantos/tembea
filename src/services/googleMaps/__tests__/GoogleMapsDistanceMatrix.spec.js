import Axios from 'axios';
import GoogleMapsDistanceMatrix from '../GoogleMapsDistanceMatrix';
import { calculateDistanceMock, noGoogleKeysMock, invalidLocationMock } from '../__mocks__';

describe('Calculate distance test', () => {
  it('should be calculate the distance between two addresses', async () => {
    Axios.get = jest.fn(() => (calculateDistanceMock));

    const result = await GoogleMapsDistanceMatrix.calculateDistance('1.272, 30.33', '1.2223, 32.222');
    expect(result).toEqual({ distanceInKm: '1.272, 30.33', distanceInMetres: '1.2223, 32.222' });
  });

  it('should not break the app if no key is provided', async () => {
    Axios.get = jest.fn(() => (noGoogleKeysMock));

    const result = await GoogleMapsDistanceMatrix.calculateDistance('1.272, 30.33', '1.2223, 32.222');
    expect(result).toEqual({ distanceInKm: 'unknown', distanceInMetres: 'unknown' });
  });
  it('should return null if invalid location is provided', async () => {
    Axios.get = jest.fn(() => (invalidLocationMock));

    const result = await GoogleMapsDistanceMatrix.calculateDistance('30, 90', 'undefined, 90');
    expect(result).toEqual({
      distanceInKm: null,
      distanceInMetres: null
    });
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

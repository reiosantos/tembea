import axios from 'axios';
import GoogleMapsDirections from '../googleMaps/GoogleMapsDirections';
import BugSnagHelper from '../../helpers/bugsnagHelper';

describe('Google Maps Directions', () => {
  beforeAll(() => {
    BugSnagHelper.log = jest.fn(() => {});
  });

  it('should fetch the direction', async () => {
    axios.get = jest.fn(() => ({
      data: 'Correct data'
    }));
    const res = await GoogleMapsDirections.getDirections('origin', 'destination');

    expect(res).toEqual('Correct data');
  });
  
  it('should catch axios error', async () => {
    axios.get = jest.fn(() => {
      throw new Error('Random error');
    });

    await GoogleMapsDirections.getDirections('origin', 'destination');
  
    expect(BugSnagHelper.log).toHaveBeenCalledTimes(1);
  });
});

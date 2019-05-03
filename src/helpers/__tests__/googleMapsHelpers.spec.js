import { Marker, RoutesHelper } from '../googleMaps/googleMapsHelpers';
import GoogleMapsDistanceMatrix from '../../services/googleMaps/GoogleMapsDistanceMatrix';
import { validHomeBStopMock, invalidHomeBStopMock } from '../__mocks__/googleMapHelpersMock';
import AddressService from '../../services/AddressService';

describe('Marker', () => {
  it('should construct a new marker', () => {
    const marker = new Marker('blue', 'A');

    expect(marker).toEqual({
      color: 'blue',
      label: 'A',
      locations: ''
    });
  });

  it('should construct a new marker with default parameters', () => {
    const marker = new Marker();

    expect(marker).toEqual({
      color: 'blue',
      label: '',
      locations: ''
    });
  });

  it('should add a location to marker', () => {
    const marker = new Marker('blue', 'A');
    marker.addLocation('Lagos');

    expect(marker).toEqual({
      color: 'blue',
      label: 'A',
      locations: '|Lagos'
    });
  });
});

describe('getDojoCoordinateFromDb', () => {
  beforeEach(() => {
    jest.spyOn(AddressService, 'findAddress').mockResolvedValue(null);
  });
  it('should throw an error when it cannot find dojo location in the database', async () => {
    try {
      await RoutesHelper.getDojoCoordinateFromDb();
    } catch (err) {
      expect(err).toEqual(new Error('Cannot find The Dojo location in the database'));
    }
  });
  it('should get the location of dojo from the database', async () => {
    jest.spyOn(AddressService, 'findAddress').mockResolvedValue({ coordinate: '12038902,-212131232' });
    const res = await RoutesHelper.getDojoCoordinateFromDb();
    expect(res).toBeTruthy();
    expect(res).toHaveProperty('coordinate');
  });
});

describe('home-busStop route Helper test', () => {
  it('should verify distance between home and busStop and return Acceptable message', async () => {
    GoogleMapsDistanceMatrix.calculateDistance = validHomeBStopMock;
    const result = await RoutesHelper.distanceBetweenDropoffAndHome('busStop, home');
    expect(result).toEqual('Acceptable Distance');
  });

  it('should verify distance between home and busStop and return UnAcceptable message',
    async () => {
      GoogleMapsDistanceMatrix.calculateDistance = invalidHomeBStopMock;
      const result = await RoutesHelper.distanceBetweenDropoffAndHome('busStop, home');
      expect(result).toEqual("Your Bus-stop can't more be than 2km away from your Home");
    });

  it('should verify distance between home and busStop and return error message', async () => {
    const errorMessage = new Error('failed');
    GoogleMapsDistanceMatrix.calculateDistance = jest.fn(() => {
      throw errorMessage;
    });
    try {
      await RoutesHelper.distanceBetweenDropoffAndHome('busStop, home');
    } catch (error) {
      expect(error).toEqual(errorMessage);
    }
  });
});

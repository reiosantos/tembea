import RouteHelper from '../RouteHelper';
import RouteService from '../../services/RouteService';
import CabService from '../../services/CabService';

describe('Route Helpers', () => {
  describe('checkTimeFormat', () => {
    it('should fail if time format does not match requirement', () => {
      const message = RouteHelper.checkTimeFormat('12:1', 'timeFormat');
      expect(message).toEqual(['timeFormat is invalid']);
    });
  });

  describe('checkNumberValues', () => {
    it('should fail if value is not a non-zero integer', () => {
      const message = RouteHelper.checkNumberValues('string', 'someField');
      expect(message).toEqual(['someField must be a non-zero integer greater than zero']);
    });
  });

  describe('checkNumberValues', () => {
    it('should fail if value is not a non-zero integer', () => {
      const message = RouteHelper.checkNumberValues('string', 'someField');
      expect(message).toEqual(['someField must be a non-zero integer greater than zero']);
    });
  });

  describe('checkCoordinates', () => {
    it('should fail if object does not contain either lat, lng, or both', () => {
      const message = RouteHelper.checkCoordinates({});
      expect(message).toEqual(['destination.coordinates must have lat & lng properties']);
    });
  });

  describe('checkThatVehicleRegNumberExists', () => {
    it('should return array containing results for the check', async () => {
      jest.spyOn(CabService, 'findByRegNumber').mockResolvedValue({ id: 1 });
      const result = await RouteHelper.checkThatVehicleRegNumberExists('AR 3GN UMBR');
      expect(Array.isArray(result)).toBeTruthy();
      expect(result[0]).toEqual(true);
    });

    it('should return array containing with first element false when vehicle absent', async () => {
      jest.spyOn(CabService, 'findByRegNumber').mockResolvedValue(null);
      const result = await RouteHelper.checkThatVehicleRegNumberExists('AR 3GN UMBR');
      expect(Array.isArray(result)).toBeTruthy();
      expect(result[0]).toEqual(false);
    });
  });
  
  describe('checkThatRouteNameExists', () => {
    it('should return array containing results for the check', async () => {
      jest.spyOn(RouteService, 'getRouteByName').mockResolvedValue({ id: 2, });
      const result = await RouteHelper.checkThatRouteNameExists('Yaba');
      expect(Array.isArray(result)).toBeTruthy();
      expect(result[0]).toEqual(true);
    });

    it('should return array containing with first element false when route missing', async () => {
      jest.spyOn(RouteService, 'getRouteByName').mockResolvedValue(null);
      const result = await RouteHelper.checkThatRouteNameExists('Yaba');
      expect(Array.isArray(result)).toBeTruthy();
      expect(result[0]).toEqual(false);
    });
  });
});

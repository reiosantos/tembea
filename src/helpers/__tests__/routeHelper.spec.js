import RouteHelper from '../RouteHelper';

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
});

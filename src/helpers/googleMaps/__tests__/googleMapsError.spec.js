import GoogleMapsError from '../googleMapsError';

describe('GoogleMapsError', () => {
  it('should need an instance of error', () => {
    const testErrorMessage = 'A test error';
    const testError = new GoogleMapsError(404, testErrorMessage);
    expect(testError.message).toEqual(testErrorMessage);
    expect(testError.code).toEqual(404);
  });
});

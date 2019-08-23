import { GoogleMapsLocationSuggestionOptions } from '../googleMapsHelpers';

describe('tests googleMapsHelpers', () => {
  describe('tests for GoogleMapsSuggestions', () => {
    let suggestedLocation;
    beforeEach(() => {
      suggestedLocation = new GoogleMapsLocationSuggestionOptions('test', 'location');
    });
    it('should instantiate the class GoogleMapsSuggestions', () => {
      expect(suggestedLocation).toBeInstanceOf(GoogleMapsLocationSuggestionOptions);
    });
  });
});

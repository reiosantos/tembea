import { Marker } from '../googleMaps/googleMapsHelpers';

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

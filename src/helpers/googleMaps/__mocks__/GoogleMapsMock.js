const GoogleMapsMock = () => jest.mock('@google/maps', () => ({
  createClient: jest.fn(() => ({
    placesNearby: jest.fn(() => ({
      asPromise: jest.fn(() => ({
        json: {
          results: [
            { geometry: { location: {} }, name: 'first' },
            { geometry: { location: {} }, name: 'first' },
            { geometry: { location: {} }, name: 'second' },
            { geometry: { location: {} }, name: 'fast' }
          ]
        },
      }))
    }))
  }))
}));

export default GoogleMapsMock;

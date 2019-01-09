export const validHomeBStopMock = jest.fn().mockResolvedValue({
  distanceInMetres: 900,
  distanceInKm: '0.9Km'
});

export const invalidHomeBStopMock = jest.fn().mockResolvedValue({
  distanceInMetres: 2900,
  distanceInKm: '2.9Km'
});

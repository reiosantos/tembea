module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('TripRequests', [{
    name: 'my trip to the dojo',
    riderId: 6,
    departureTime: new Date('November 16 2018 12:30'),
    originId: 1,
    destinationId: 1,
    requestedById: 6,
    departmentId: 3,
    createdAt: '2018-12-03',
    updatedAt: '2018-12-03'
  }], {}),
  down: (queryInterface) => queryInterface.bulkDelete('TripRequest', null, {})
};

module.exports = {
  up: queryInterface => queryInterface.bulkInsert('TripRequests', [
    {
      name: 'my trip home',
      riderId: 5,
      departureTime: new Date(
        new Date().getTime() - 864000000
      ).toLocaleString(),
      originId: 1,
      tripStatus: 'Confirmed',
      destinationId: 2,
      requestedById: 7,
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      name: 'my trip to the dojo',
      riderId: 7,
      departureTime: new Date(
        new Date().getTime() - 864000000
      ).toLocaleString(),
      tripStatus: 'Confirmed',
      originId: 2,
      destinationId: 1,
      requestedById: 7,
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      name: 'my trip home',
      riderId: 10,
      departureTime: new Date(
        new Date().getTime() - 864000000
      ).toLocaleString(),
      originId: 1,
      tripStatus: 'Confirmed',
      destinationId: 2,
      requestedById: 7,
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      name: 'my trip to the dojo',
      riderId: 7,
      departureTime: new Date(
        new Date().getTime() - 864000000
      ).toLocaleString(),
      tripStatus: 'Confirmed',
      originId: 2,
      destinationId: 1,
      requestedById: 10,
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      name: 'my trip to the Airport',
      riderId: 5,
      departureTime: new Date(
        new Date().getTime() + 864000000
      ).toLocaleString(),
      originId: 2,
      tripStatus: 'Confirmed',
      destinationId: 1,
      requestedById: 7,
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      name: 'my trip home',
      riderId: 8,
      departureTime: new Date(
        new Date().getTime() - 86400000000
      ).toLocaleString(),
      tripStatus: 'Confirmed',
      originId: 1,
      destinationId: 2,
      requestedById: 8,
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      name: 'my trip to the dojo',
      riderId: 8,
      departureTime: new Date(
        new Date().getTime() - 86400000000
      ).toLocaleString(),
      tripStatus: 'Confirmed',
      originId: 2,
      destinationId: 1,
      requestedById: 8,
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      name: 'my trip to the Airport',
      riderId: 5,
      departureTime: new Date(
        new Date().getTime() - 86400000000
      ).toLocaleString(),
      tripStatus: 'Pending',
      originId: 2,
      destinationId: 1,
      requestedById: 8,
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      name: 'my trip home',
      riderId: 9,
      departureTime: '11/21/2018 22:00',
      originId: 1,
      destinationId: 2,
      tripStatus: 'Confirmed',
      requestedById: 9,
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      name: 'my trip to the dojo',
      riderId: 9,
      departureTime: '12/12/2018 22:00',
      tripStatus: 'Confirmed',
      originId: 2,
      destinationId: 1,
      requestedById: 9,
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      name: 'my trip to the Airport',
      riderId: 9,
      departureTime: '12/12/2018 22:00',
      tripStatus: 'Confirmed',
      originId: 2,
      destinationId: 1,
      requestedById: 9,
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    }
  ]),
  down: queryInterface => queryInterface.bulkDelete('TripRequests')
};

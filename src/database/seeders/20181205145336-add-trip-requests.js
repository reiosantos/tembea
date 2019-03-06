const Utils = require('../../utils');

module.exports = {
  up: queryInterface => queryInterface.bulkInsert('TripRequests', [
    {
      name: 'my trip home',
      riderId: 5,
      departureTime: Utils.formatDateForDatabase('02/02/2016 23:00'),
      originId: 1,
      tripStatus: 'Confirmed',
      destinationId: 2,
      requestedById: 7,
      departmentId: 1,
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      name: 'my trip to the dojo',
      riderId: 7,
      departureTime: Utils.formatDateForDatabase('12/12/2017 11:30'),
      tripStatus: 'Confirmed',
      originId: 2,
      destinationId: 1,
      requestedById: 7,
      departmentId: 2,
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      name: 'my trip home',
      riderId: 10,
      departureTime: Utils.formatDateForDatabase('23/12/2017 01:15'),
      originId: 1,
      tripStatus: 'Confirmed',
      destinationId: 2,
      requestedById: 7,
      departmentId: 3,
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      name: 'my trip to the dojo',
      riderId: 7,
      departureTime: Utils.formatDateForDatabase('09/04/2017 12:45'),
      tripStatus: 'Confirmed',
      originId: 2,
      destinationId: 1,
      requestedById: 10,
      departmentId: 4,
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      name: 'my trip to the Airport',
      riderId: 5,
      departureTime: Utils.formatDateForDatabase('15/05/2019 09:11'),
      originId: 2,
      tripStatus: 'Confirmed',
      destinationId: 1,
      requestedById: 7,
      departmentId: 5,
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      name: 'my trip home',
      riderId: 8,
      departureTime: Utils.formatDateForDatabase('02/06/2019 19:30'),
      tripStatus: 'Confirmed',
      originId: 1,
      destinationId: 2,
      requestedById: 8,
      departmentId: 6,
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      name: 'my trip to the dojo',
      riderId: 8,
      departureTime: Utils.formatDateForDatabase('06/06/2018 03:49'),
      tripStatus: 'Confirmed',
      originId: 2,
      destinationId: 1,
      requestedById: 8,
      departmentId: 7,
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      name: 'my trip to the Airport',
      riderId: 5,
      departureTime: Utils.formatDateForDatabase('21/12/2017 17:15'),
      tripStatus: 'Pending',
      originId: 2,
      destinationId: 1,
      requestedById: 8,
      departmentId: 8,
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      name: 'my trip home',
      riderId: 9,
      departureTime: '2018-11-21 22:00',
      originId: 1,
      destinationId: 2,
      tripStatus: 'Confirmed',
      requestedById: 9,
      departmentId: 9,
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      name: 'my trip to the dojo',
      riderId: 9,
      departureTime: '2018-12-12 22:00',
      tripStatus: 'Confirmed',
      originId: 2,
      destinationId: 1,
      requestedById: 9,
      departmentId: 10,
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      name: 'my trip to the Airport',
      riderId: 9,
      departureTime: '2018-12-12 22:00',
      tripStatus: 'Confirmed',
      originId: 2,
      destinationId: 1,
      requestedById: 9,
      departmentId: 1,
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    }
  ]),
  down: queryInterface => queryInterface.bulkDelete('TripRequests')
};

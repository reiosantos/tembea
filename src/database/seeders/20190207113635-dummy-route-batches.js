module.exports = {
  up: queryInterface => queryInterface.bulkInsert('RouteBatches', [
    {
      takeOff: '00:00',
      batch: 'A',
      capacity: 6,
      status: 'Active',
      comments: 'Route to Thika using Thika Super Highway',
      routeId: 1,
      cabId: 1,
      createdAt: '2019-01-22 22:59:23.326000',
      updatedAt: '2019-01-22 22:59:23.326000'
    },
    {
      takeOff: '01:00',
      batch: 'A',
      capacity: 4,
      status: 'Active',
      comments: 'Route to Qwetu through Allsops',
      routeId: 2,
      cabId: 2,
      createdAt: '2019-01-22 22:59:23.326000',
      updatedAt: '2019-01-22 22:59:23.326000'
    },
  ]),

  down: queryInterface => queryInterface.bulkDelete('RouteBatches', null, {})

};

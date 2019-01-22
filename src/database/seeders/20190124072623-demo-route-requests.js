module.exports = {
  up: queryInterface => queryInterface.bulkInsert('RouteRequests', [
    {
      distance: 2.00,
      opsComment: 'not yet okay',
      managerComment: 'okay',
      engagementId: 1,
      managerId: 2,
      busStopId: 2,
      homeId: 1,
      busStopDistance: 2.4,
      routeImageUrl: 'https://s3-us-west-2.amazonaws.com/uw-s3-cdn/wp-content/uploads/sites/6/2017/01/04143600/Access-Map-screenshot1.jpg',
      status: 'Pending',
      createdAt: '2019-01-22 22:59:23.326000',
      updatedAt: '2019-01-22 22:59:23.326000'
    }
  ]),

  down: queryInterface => queryInterface.bulkDelete('RouteRequests', null, {})
};

module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Locations', [
    {
      longitude: 36.886215,
      latitude: -1.219539,
      createdAt: '2019-01-22 22:59:23.326000',
      updatedAt: '2019-01-22 22:59:25.006000'
    },
    {
      longitude: 3.3657035,
      latitude: 6.5538288,
      createdAt: '2019-01-22 22:59:23.326000',
      updatedAt: '2019-01-22 22:59:25.006000'
    }
  ]),
  down: (queryInterface) => queryInterface.bulkDelete('Locations')
};

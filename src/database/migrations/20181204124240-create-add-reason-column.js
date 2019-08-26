module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('TripRequests',
    'reason', Sequelize.TEXT),
  down: (queryInterface) => queryInterface.removeColumn('TripRequests', 'reason')
};

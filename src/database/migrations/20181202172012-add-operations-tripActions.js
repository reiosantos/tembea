module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'TripRequests', 'operationsComment', {
      type: Sequelize.TEXT,
    }
  ),
  down: (queryInterface) => queryInterface.removeColumn(
    'TripRequests',
    'operationsComment',
  )
};


module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('TripRequests', 'driverId', {
    allowNull: true,
    type: Sequelize.INTEGER
  }),
  down: (queryInterface) => queryInterface.removeColumn('TripRequests', 'driverId')

};

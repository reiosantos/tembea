
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('TripRequests', 'tripNotTakenReason', {
    type: Sequelize.TEXT
  }),

  down: (queryInterface) => queryInterface.removeColumn('TripRequests', 'tripNotTakenReason')
};

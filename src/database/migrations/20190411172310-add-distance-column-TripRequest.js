
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('TripRequests', 'distance', {
    type: Sequelize.STRING
  }),
  
  down: (queryInterface) => queryInterface.removeColumn('TripRequests', 'distance')
};

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('TripRequests',
    'tripNote', Sequelize.TEXT),
  
  down: (queryInterface) => queryInterface.removeColumn('TripRequests',
    'tripNote')
};

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('TripRequests', 'rating', {
    allowNull: true,
    type: Sequelize.INTEGER
  }),

  down: (queryInterface) => queryInterface.removeColumn('TripRequests', 'rating')
};

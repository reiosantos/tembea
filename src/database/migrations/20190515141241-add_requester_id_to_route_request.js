module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('RouteRequests', 'requesterId', {
    type: Sequelize.INTEGER,
    allowNull: true
  }),
  down: (queryInterface) => queryInterface.removeColumn('RouteRequests', 'requesterId')
};

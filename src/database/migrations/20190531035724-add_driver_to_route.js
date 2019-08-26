
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('RouteBatches', 'driverId', {
    type: Sequelize.INTEGER,
    references: {
      model: 'Drivers',
      key: 'id',
      as: 'driver'
    }
  }),
  down: (queryInterface) => queryInterface.removeColumn('RouteBatches', 'driverId')
};


module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('RouteBatches', 'deletedAt', {
    type: Sequelize.DATE
  }),

  down: (queryInterface) => queryInterface.removeColumn('RouteBatches', 'deletedAt')
};

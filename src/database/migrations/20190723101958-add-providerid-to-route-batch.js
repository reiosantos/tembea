module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'RouteBatches', 'providerId',
    {
      type: Sequelize.INTEGER,
      allowNull: true
    }
  ),
  down: (queryInterface) => queryInterface.removeColumn('RouteBatches', 'providerId')
};

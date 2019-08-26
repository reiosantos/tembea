module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Users',
    'routeBatchId',
    {
      type: Sequelize.INTEGER,
      references: {
        model: 'RouteBatches',
        key: 'id',
        as: 'routeBatch'
      },
    }
  ),

  down: (queryInterface) => queryInterface.removeColumn('Users', 'routeBatchId')
};

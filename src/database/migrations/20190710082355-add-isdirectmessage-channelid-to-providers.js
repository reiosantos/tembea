module.exports = {
  up: (queryInterface, Sequelize) => (
    queryInterface.sequelize.transaction((t) => (
      Promise.all([
        queryInterface.addColumn('Providers', 'isDirectMessage', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        }, { transaction: t }),
        queryInterface.addColumn('Providers', 'channelId', {
          type: Sequelize.STRING,
          allowNull: true,
        }, { transaction: t })
      ])
    ))
  ),

  down: (queryInterface) => queryInterface.sequelize.transaction((t) => (
    Promise.all([
      queryInterface.removeColumn('Providers', 'isDirectMessage', { transaction: t }),
      queryInterface.removeColumn('Providers', 'channelId', { transaction: t })
    ])
  ))
};

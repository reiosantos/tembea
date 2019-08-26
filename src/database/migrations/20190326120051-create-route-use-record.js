
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('RouteUseRecords', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    batchId: {
      allowNull: true,
      type: Sequelize.INTEGER,
      references: {
        model: 'RouteBatches',
        key: 'id',
        as: 'batch'
      }
    },
    batchUseDate: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    confirmedUsers: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    unConfirmedUsers: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    skippedUsers: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    pendingUsers: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  }),
  down: (queryInterface) => queryInterface.dropTable('RouteUseRecords')
};

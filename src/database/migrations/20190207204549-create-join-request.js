module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('JoinRequests', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    managerComment: {
      type: Sequelize.STRING
    },
    status: {
      allowNull: false,
      type: Sequelize.ENUM(
        'Pending',
        'Approved',
        'Declined',
        'Confirmed',
      ),
      defaultValue: 'Pending'
    },
    engagementId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'Engagements',
        key: 'id',
        as: 'engagement'
      }
    },
    managerId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
        as: 'manager'
      }
    },
    routeBatchId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'RouteBatches',
        key: 'id',
        as: 'routeBatch'
      }
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
  down: (queryInterface) => queryInterface.dropTable('JoinRequests')
};

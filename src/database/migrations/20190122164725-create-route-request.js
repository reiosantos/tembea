module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('RouteRequests', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    opsComment: {
      type: Sequelize.STRING
    },
    managerComment: {
      type: Sequelize.STRING
    },
    distance: {
      type: Sequelize.DOUBLE
    },
    busStopDistance: {
      type: Sequelize.DOUBLE
    },
    routeImageUrl: {
      type: Sequelize.TEXT
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
    busStopId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'Addresses',
        key: 'id',
        as: 'busStop'
      }
    },
    homeId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'Addresses',
        key: 'id',
        as: 'home'
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
  down: (queryInterface) => queryInterface.dropTable('RouteRequests')
};

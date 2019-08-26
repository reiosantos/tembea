
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('RouteBatches', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    takeOff: {
      type: Sequelize.STRING
    },
    capacity: {
      type: Sequelize.INTEGER
    },
    inUse: {
      type: Sequelize.INTEGER
    },
    status: {
      allowNull: false,
      type: Sequelize.ENUM(
        'Active',
        'Inactive',
      ),
      defaultValue: 'Inactive'
    },
    comments: {
      type: Sequelize.TEXT
    },
    batch: {
      type: Sequelize.STRING
    },
    cabId: {
      allowNull: true,
      type: Sequelize.INTEGER,
      references: {
        model: 'Cabs',
        key: 'id',
        as: 'cabDetails'
      }
    },
    routeId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'Routes',
        key: 'id',
        as: 'route'
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
  down: (queryInterface) => queryInterface.dropTable('RouteBatches')
};

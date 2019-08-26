
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Drivers', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    driverName: {
      type: Sequelize.STRING,
    },
    driverPhoneNo: {
      unique: true,
      type: Sequelize.STRING
    },
    driverNumber: {
      unique: true,
      type: Sequelize.STRING
    },
    email: {
      unique: true,
      type: Sequelize.STRING,
    },
    providerId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'Providers',
        key: 'id',
        as: 'provider'
      }
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    deletedAt: {
      type: Sequelize.DATE
    }
  }),
  down: (queryInterface) => queryInterface.dropTable('Drivers')
};

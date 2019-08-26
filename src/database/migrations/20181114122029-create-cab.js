module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Cabs', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    driverName: {
      type: Sequelize.STRING
    },
    driverPhoneNo: {
      unique: true,
      type: Sequelize.STRING
    },
    regNumber: {
      unique: true,
      type: Sequelize.STRING
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
  down: (queryInterface) => queryInterface.dropTable('Cabs'),
};

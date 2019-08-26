module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Addresses', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    locationId: {
      allowNull: true,
      type: Sequelize.INTEGER,
      references: {
        model: 'Locations',
        key: 'id',
        as: 'location',
      }
    },
    address: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    }
  }),
  down: (queryInterface) => queryInterface.dropTable('Addresses'),
};

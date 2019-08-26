module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Providers', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    name: {
      unique: true,
      type: Sequelize.STRING,
    },
    providerUserId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
        as: 'user'
      }
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    deletedAt: {
      type: Sequelize.DATE
    }
  }),
  down: (queryInterface) => queryInterface.dropTable('Providers'),
};

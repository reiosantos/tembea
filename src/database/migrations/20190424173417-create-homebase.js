module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Homebases', {
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
    countryId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Countries',
        key: 'id',
        as: 'country',
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
  down: (queryInterface) => queryInterface.dropTable('Homebases'),
};

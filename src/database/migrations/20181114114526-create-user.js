module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Users', {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: Sequelize.INTEGER,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    slackId: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    phoneNo: {
      unique: true,
      allowNull: true,
      type: Sequelize.STRING,
    },
    email: {
      unique: true,
      type: Sequelize.STRING,
    },
    defaultDestinationId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Addresses',
        key: 'id',
        as: 'defaultDestination',
      }
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
  down: (queryInterface) => queryInterface.dropTable('Users'),
};

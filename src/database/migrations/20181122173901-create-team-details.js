module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('TeamDetails', {
    teamId: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.STRING
    },
    botId: {
      unique: true,
      type: Sequelize.STRING,
      allowNull: false,
    },
    botToken: {
      unique: true,
      type: Sequelize.STRING,
      allowNull: false,
    },
    teamName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    teamUrl: {
      unique: true,
      type: Sequelize.STRING,
      allowNull: false,
    },
    webhookConfigUrl: {
      unique: true,
      type: Sequelize.STRING,
      allowNull: false,
    },
    userId: {
      unique: true,
      type: Sequelize.STRING,
      allowNull: false,
    },
    userToken: {
      unique: true,
      type: Sequelize.STRING,
      allowNull: false,
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
  down: (queryInterface) => queryInterface.dropTable('TeamDetails'),
};

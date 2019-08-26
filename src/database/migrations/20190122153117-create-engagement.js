
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Engagements', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    fellowId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
      }
    },
    partnerId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Partners',
        key: 'id',
      },
    },
    startDate: {
      type: Sequelize.STRING
    },
    endDate: {
      type: Sequelize.STRING
    },
    workHours: {
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
  })
    .then(() => queryInterface.addConstraint('Engagements', ['partnerId', 'fellowId'], {
      type: 'unique',
      name: 'Engagements_partnerId_fellowId'
    })),
  down: (queryInterface) => queryInterface.dropTable('Engagements')
};

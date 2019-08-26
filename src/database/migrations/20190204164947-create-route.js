
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Routes', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    name: {
      type: Sequelize.STRING
    },
    imageUrl: {
      type: Sequelize.TEXT
    },
    destinationId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'Addresses',
        key: 'id',
        as: 'destination'
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
  down: (queryInterface) => queryInterface.dropTable('Routes')
};

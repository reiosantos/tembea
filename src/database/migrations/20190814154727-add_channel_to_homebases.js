
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Homebases', 'channel', {
    type: Sequelize.STRING,
    allowNull: true
  }),

  down: (queryInterface) => queryInterface.removeColumn('Homebases', 'channel')
};

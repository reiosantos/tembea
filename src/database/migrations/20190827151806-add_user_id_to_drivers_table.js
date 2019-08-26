
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Drivers', 'userId', {
    type: Sequelize.INTEGER,
    allowNull: true
  }),

  down: (queryInterface) => queryInterface.removeColumn('Drivers', 'userId')
};

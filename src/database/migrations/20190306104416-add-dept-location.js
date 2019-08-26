module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Departments', 'location', {
    type: Sequelize.STRING
  }),

  down: (queryInterface) => queryInterface.removeColumn('Departments', 'location')
};

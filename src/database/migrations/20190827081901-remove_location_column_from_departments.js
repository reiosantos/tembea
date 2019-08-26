module.exports = {
  up: (queryInterface) => queryInterface.removeColumn('Departments', 'location'),

  down: (queryInterface, Sequelize) => queryInterface.addColumn('Departments', 'location', {
    type: Sequelize.STRING,
    defaultValue: 'Nariobi'
  })
};

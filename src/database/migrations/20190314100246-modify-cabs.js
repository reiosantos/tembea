module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.addColumn(
      'Cabs',
      'capacity',
      Sequelize.STRING
    ),
    queryInterface.addColumn(
      'Cabs',
      'model',
      Sequelize.STRING
    ),
    queryInterface.addColumn(
      'Cabs',
      'location',
      Sequelize.STRING
    )
  ]),

  down: (queryInterface) => Promise.all([
    queryInterface.removeColumn('Cabs', 'capacity'),
    queryInterface.removeColumn('Cabs', 'model'),
    queryInterface.removeColumn('Cabs', 'location')
  ])
};

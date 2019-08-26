module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.addColumn(
      'Cabs',
      'deletedAt',
      Sequelize.DATE
    )
  ]),
  
  down: (queryInterface) => Promise.all([
    queryInterface.removeColumn('Cabs', 'deletedAt')
  ])
};


module.exports = {
  up: (queryInterface) => Promise.all([
    queryInterface.removeColumn('Cabs', 'location'),
    queryInterface.removeColumn('Cabs', 'driverName'),
    queryInterface.removeColumn('Cabs', 'driverPhoneNo')
  ]),


  down: (queryInterface, Sequelize) => Promise.all([
    queryInterface.addColumn('Cabs', 'driverPhoneNo', Sequelize.STRING),
    queryInterface.addColumn('Cabs', 'driverName', Sequelize.STRING),
    queryInterface.addColumn('Cabs', 'location', Sequelize.STRING)
  ])
};

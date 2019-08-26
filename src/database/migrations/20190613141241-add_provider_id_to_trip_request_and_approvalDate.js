module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('TripRequests', 'providerId', {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'Providers',
      key: 'id',
      as: 'provider',
    }
  }).then(() => queryInterface.addColumn('TripRequests', 'approvalDate', {
    type: Sequelize.STRING,
    allowNull: true,
  })),
  down: (queryInterface) => queryInterface.removeColumn('TripRequests', 'providerId')
    .then(() => queryInterface.removeColumn('TripRequests', 'approvalDate'))
};

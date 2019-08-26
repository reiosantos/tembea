module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Cabs', 'providerId', {
    type: Sequelize.INTEGER,
    references: {
      model: 'Providers',
      key: 'id',
      as: 'provider'
    }
  }),
  down: (queryInterface) => queryInterface.removeColumn('Cabs', 'providerId')
};

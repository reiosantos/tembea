module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.changeColumn('RouteBatches', 'cabId', {
    type: Sequelize.INTEGER,
    allowNull: true
  }),
  down: (queryInterface, Sequelize) => queryInterface.changeColumn('RouteBatches', 'cabId', {
    type: Sequelize.INTEGER,
    allowNull: false
  })
};

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('TeamDetails', 'opsChannelId', {
    allowNull: false,
    type: Sequelize.STRING,
    defaultValue: 'opsChannelId'
  }),
  down: (queryInterface) => queryInterface.removeColumn('TeamDetails', 'opsChannelId')
};

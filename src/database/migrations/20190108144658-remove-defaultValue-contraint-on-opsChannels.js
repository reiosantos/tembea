module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.changeColumn('TeamDetails', 'opsChannelId', {
    allowNull: false,
    type: Sequelize.STRING
  }),

  down: (queryInterface, Sequelize) => queryInterface.changeColumn('TeamDetails', 'opsChannelId', {
    allowNull: false,
    type: Sequelize.STRING,
    defaultValue: 'opsChannelId'
  })
};

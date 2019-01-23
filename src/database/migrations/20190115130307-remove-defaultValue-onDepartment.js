module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.changeColumn('Departments', 'teamId', {
    allowNull: false,
    type: Sequelize.STRING
  }),

  down: (queryInterface, Sequelize) => queryInterface.changeColumn('Departments', 'teamId', {
    allowNull: false,
    type: Sequelize.STRING,
    defaultValue: 'TE2K8PGF8'
  })
};

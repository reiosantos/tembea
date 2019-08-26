module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Departments', 'teamId', {
    allowNull: false,
    type: Sequelize.STRING,
    defaultValue: 'TE2K8PGF8'
  }),
  down: (queryInterface) => queryInterface.removeColumn('Departments', 'teamId')
};

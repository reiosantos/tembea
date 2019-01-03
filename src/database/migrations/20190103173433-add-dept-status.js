module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Departments', 'status', {
    allowNull: false,
    type: Sequelize.ENUM(
      'Active',
      'Inactive'
    ),
    defaultValue: 'Active'
  }),

  down: (queryInterface) => {
    queryInterface.removeColumn('Departments', 'status');
    return queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Departments_status" CASCADE;');
  }
};

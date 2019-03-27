module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Countries', 'status', {
    allowNull: false,
    type: Sequelize.ENUM(
      'Active',
      'Inactive'
    ),
    defaultValue: 'Active'
  }),

  down: (queryInterface) => {
    queryInterface.removeColumn('Countries', 'status');
    return queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Countries_status" CASCADE;');
  }
};

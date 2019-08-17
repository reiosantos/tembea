module.exports = {
  up: queryInterface => queryInterface.removeConstraint('Departments', 'Departments_name_key'),

  down: (queryInterface, Sequelize) => queryInterface.changeColumn('Departments', 'name',
    {
      type: Sequelize.STRING,
      unique: true
    })
};

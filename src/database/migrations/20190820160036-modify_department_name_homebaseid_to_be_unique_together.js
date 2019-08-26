module.exports = {
  up: (queryInterface) => queryInterface.sequelize.query(`ALTER TABLE "Departments" ADD CONSTRAINT
      departments_name_homebase_ukey
     UNIQUE ("name", "homebaseId");`),

  down: (queryInterface, Sequelize) => queryInterface.changeColumn('Departments', 'name',
    {
      type: Sequelize.STRING,
      unique: true
    })
};

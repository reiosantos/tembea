module.exports = {
  up: (queryInterface) => queryInterface.sequelize.query(`ALTER TABLE "Departments"
   ALTER COLUMN location SET DEFAULT 'Nairobi'; UPDATE "Departments" 
   SET location = 'Nairobi' WHERE location is NULL;`),

  down: (queryInterface) => queryInterface.sequelize.query(`ALTER TABLE "Departments"
  ALTER COLUMN location DROP DEFAULT`)
  
};

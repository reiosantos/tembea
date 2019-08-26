module.exports = {
  up: (queryInterface) => queryInterface.sequelize.query(`ALTER TABLE "UserRoles" ADD CONSTRAINT
        user_role_homebase_unique_together_key UNIQUE ("userId", "roleId","homebaseId");`),
  down: (queryInterface) => queryInterface.removeConstraint('UserRoles',
    'user_role_homebase_unique_together_key')
};

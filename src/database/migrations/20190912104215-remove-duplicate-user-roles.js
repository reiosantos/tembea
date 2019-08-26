module.exports = {
  up: (queryInterface) => queryInterface.sequelize.query(`
  WITH uniques AS (
      SELECT * FROM (SELECT DISTINCT ON ("userId", "roleId", "homebaseId") * FROM "UserRoles") as
       uniqueRoles
      ORDER BY "updatedAt" DESC
   )
   DELETE FROM "UserRoles" role
    WHERE NOT EXISTS (
      SELECT id
      FROM uniques u
      WHERE role.id = u.id
    );
  `),
  down: () => Promise.resolve()
};

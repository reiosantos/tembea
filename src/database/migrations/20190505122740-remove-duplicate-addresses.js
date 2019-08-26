module.exports = {
  up: (queryInterface) => queryInterface.sequelize.query(`
    WITH uniques AS (
      SELECT DISTINCT ON (address) * FROM "Addresses" ORDER BY address, "updatedAt" DESC
    )
    DELETE FROM "Addresses" a 
    WHERE NOT EXISTS (
      SELECT id 
      FROM uniques u 
      WHERE a.id = u.id
    );
  `),
  down: () => Promise.resolve()
};

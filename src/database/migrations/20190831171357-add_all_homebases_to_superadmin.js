const getQuery = () => `
DO $$
DECLARE
  HOMEBASES RECORD;
  SUPERADMINS RECORD;
  getHb text;
  getSa text;

BEGIN
  getHb := 'SELECT * FROM "Homebases" WHERE "name" != ''Nairobi''';

  CREATE TEMP TABLE SADMINSRESULT AS SELECT "userId", "roleId"
  FROM "UserRoles" as UR
  INNER JOIN "Roles" as R ON UR."roleId" = R.id
  INNER JOIN "Homebases" as HB ON UR."homebaseId" = HB.id
  WHERE R."name" = 'Super Admin' AND HB.name = 'Nairobi';

FOR HOMEBASES IN EXECUTE getHb
  LOOP
    FOR SUPERADMINS IN SELECT * FROM SADMINSRESULT
    LOOP
      INSERT INTO "UserRoles" ("userId", "roleId", "homebaseId", "createdAt", "updatedAt") VALUES (SUPERADMINS."userId", SUPERADMINS."roleId", HOMEBASES."id", '2019-08-14 14:57:48.935+00', '2019-08-14 14:57:48.935+00');
    END LOOP;
  END LOOP;
END; $$`;

module.exports = {
  up: (queryInterface) => queryInterface.sequelize.query(getQuery()),

  down: () => Promise.resolve()
};

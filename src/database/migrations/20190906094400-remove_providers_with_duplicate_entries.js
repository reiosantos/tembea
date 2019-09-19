/* eslint-disable no-irregular-whitespace */
const fixDuplicateProviders = `DO $$
DECLARE
  prov record;
  get_provs varchar := 'SELECT * FROM provList';
BEGIN
  CREATE TEMP TABLE provList AS SELECT DISTINCT ON ("providerUserId") * FROM "Providers"
    ORDER BY "providerUserId", "id" ASC;
  FOR prov IN EXECUTE get_provs
    LOOP
      UPDATE "TripRequests" tr
      SET "providerId" = prov.id
      FROM "Providers" prv
      WHERE tr."providerId" = prv.id
      AND prv."providerUserId" = prov."providerUserId";
    END LOOP;

  FOR prov IN EXECUTE get_provs
    LOOP
      UPDATE "RouteBatches" rb
      SET "providerId" = prov.id
      FROM "Providers" prv
      WHERE rb."providerId" = prv.id
      AND prv."providerUserId" = prov."providerUserId";
    END LOOP;

  FOR prov IN EXECUTE get_provs
    LOOP
      UPDATE "Cabs" cb
      SET "providerId" = prov.id
      FROM "Providers" prv
      WHERE cb."providerId" = prv.id
      AND prv."providerUserId" = prov."providerUserId";
    END LOOP;

  FOR prov IN EXECUTE get_provs
    LOOP
      UPDATE "Drivers" drv
      SET "providerId" = prov.id
      FROM "Providers" prv
      WHERE drv."providerId" = prv.id
      AND prv."providerUserId" = prov."providerUserId";
    END LOOP;
  DROP TABLE provList;
END;
$$;`;

const deleteDuplicateProviders = `WITH uniques AS (
  SELECT DISTINCT ON ("providerUserId") * FROM "Providers" ORDER BY "providerUserId", "id" ASC
)
  DELETE FROM "Providers" prv
  WHERE NOT EXISTS (
    SELECT id
    FROM uniques u
    WHERE prv.id = u.id
  );`;

module.exports = {
  up: (queryInterface) => queryInterface.sequelize.query(fixDuplicateProviders)
    .then(() => queryInterface.sequelize.query(deleteDuplicateProviders)),

  down: () => Promise.resolve()
};

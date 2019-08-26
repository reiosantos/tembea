module.exports = {
  up: (queryInterface) => queryInterface.sequelize.query(`
    DO $$
    DECLARE
      num_rows integer := (select count(*) from "Addresses" where address = 'Andela Nairobi');
    BEGIN 
      IF num_rows < 1 THEN 
        with locId as (
          INSERT INTO "Locations" (longitude, latitude, "createdAt", "updatedAt")
          VALUES (
            36.886215,
            -1.219539,
            '2019-05-09 10:00:00.326000',
            '2019-05-09 10:00:00.326000'
          )
          RETURNING id
        ) INSERT INTO "Addresses"
          ("locationId", address, "createdAt", "updatedAt")
          VALUES (
            (SELECT * FROM locId),
            'Andela Nairobi',
            '2019-05-09 10:00:00.326000',
            '2019-05-09 10:00:00.326000'
          );
      ELSE
        with locId as (
          SELECT id from "Locations" WHERE longitude = 36.886215 AND latitude = -1.219539 LIMIT 1
        )
        UPDATE "Addresses" SET "locationId" = (SELECT * FROM locId)
        WHERE "Addresses"."address" = 'Andela Nairobi';
      END IF;
    END $$;
  `),

  down: () => Promise.resolve()
};

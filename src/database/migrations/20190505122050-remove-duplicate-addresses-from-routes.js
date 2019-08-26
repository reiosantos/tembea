module.exports = {
  up: (queryInterface) => queryInterface.sequelize.query(`
    DO $$
      DECLARE
        addr record;
      BEGIN
        FOR addr IN SELECT DISTINCT ON (address) * FROM "Addresses" 
          ORDER BY address, "updatedAt" DESC
        LOOP
          UPDATE "Routes"
          SET "destinationId" = addr.id
          FROM "Addresses"
          WHERE "Routes"."destinationId" = "Addresses".id AND "Addresses"."address" = addr.address;
        END LOOP;

        FOR addr IN SELECT DISTINCT ON (address) * FROM "Addresses" 
          ORDER BY address, "updatedAt" DESC
        LOOP
          UPDATE "RouteRequests"
          SET "homeId" = addr.id
          FROM "Addresses"
          WHERE "RouteRequests"."homeId" = "Addresses".id AND "Addresses"."address" = addr.address;
        END LOOP;

        FOR addr IN SELECT DISTINCT ON (address) * FROM "Addresses" 
          ORDER BY address, "updatedAt" DESC
        LOOP
          UPDATE "RouteRequests"
          SET "busStopId" = addr.id
          FROM "Addresses"
          WHERE "RouteRequests"."busStopId" = "Addresses".id 
            AND "Addresses"."address" = addr.address;
        END LOOP;
      END;
    $$;
  `),
  down: () => Promise.resolve()
};

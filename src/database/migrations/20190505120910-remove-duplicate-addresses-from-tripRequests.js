module.exports = {
  up: (queryInterface) => queryInterface.sequelize.query(`
    DO $$
      DECLARE
        addr record;
      BEGIN
        FOR addr IN SELECT DISTINCT ON (address) * FROM "Addresses" 
          ORDER BY address, "updatedAt" DESC
        LOOP
          UPDATE "TripRequests"
          SET "originId" = addr.id
          FROM "Addresses"
          WHERE "TripRequests"."originId" = "Addresses".id 
            AND "Addresses"."address" = addr.address;
        END LOOP;
    
        FOR addr IN SELECT DISTINCT ON (address) * FROM "Addresses" 
          ORDER BY address, "updatedAt" DESC
        LOOP
          UPDATE "TripRequests"
          SET "destinationId" = addr.id
          FROM "Addresses"
          WHERE "TripRequests"."destinationId" = "Addresses".id 
            AND "Addresses"."address" = addr.address;
        END LOOP;
      END;
    $$;
  `),
  down: () => Promise.resolve()
};


module.exports = {
  up: queryInterface => queryInterface.sequelize.query(
    `
DO $$
BEGIN  
    INSERT INTO "Drivers" ("driverPhoneNo","driverName",
    "createdAt","updatedAt", "providerId")
    SELECT "driverPhoneNo", "driverName",
    "createdAt","updatedAt","providerId" FROM "Cabs" as Cabs
    WHERE NOT EXISTS(SELECT "driverName" 
    FROM "Drivers" WHERE "Drivers"."driverPhoneNo" != Cabs."driverPhoneNo");
END $$;
    `
  ),
  down: () => Promise.resolve()
};

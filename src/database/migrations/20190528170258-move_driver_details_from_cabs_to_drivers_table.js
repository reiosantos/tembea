module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Drivers_Backup', {
      driverName: {
        type: Sequelize.STRING,
      },
      driverPhoneNo: {
        unique: true,
        type: Sequelize.STRING
      },
      driverNumber: {
        unique: true,
        type: Sequelize.STRING
      },
      cabRegNumber: {
        unique: true,
        type: Sequelize.STRING
      }
    });
    return queryInterface.sequelize.query(`
      DO $$
      BEGIN
          INSERT INTO "Drivers_Backup" ("driverPhoneNo","driverName",
          "cabRegNumber")
          SELECT "driverPhoneNo", "driverName",
          "regNumber" FROM "Cabs" as Cabs;
      END $$;
    `);
  },
  down: () => Promise.resolve()
};

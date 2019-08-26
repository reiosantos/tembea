const createHomebaseQuery = ({ country, homebase }) => `
  DO $$
  DECLARE countryId integer;
  BEGIN
    INSERT INTO "Countries" ("name") VALUES ('${country}') ON CONFLICT DO NOTHING;
    SELECT id INTO countryId FROM "Countries" WHERE "name"='${country}';
    INSERT INTO "Homebases" ("name", "countryId") VALUES ('${homebase}', countryId)
    ON CONFLICT DO NOTHING;
  END $$`;

const homebases = [
  {
    country: 'Kenya',
    homebase: 'Nairobi'
  },
  {
    country: 'Uganda',
    homebase: 'Kampala'
  },
  {
    country: 'Rwanda',
    homebase: 'Kigali'
  },
  {
    country: 'Nigeria',
    homebase: 'Lagos'
  },
  {
    country: 'Egypt',
    homebase: 'Cairo'
  }
];

module.exports = {
  up: async (queryInterface) => {
    const homebasesQ = homebases.map((h) => queryInterface.sequelize.query(createHomebaseQuery(h)));
    await Promise.all(homebasesQ);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Homebases', null, {});
    await queryInterface.bulkDelete('Countries', null, {});
  }
};

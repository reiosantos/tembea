let homebaseId;
const insertDefaultLocationsQuery = (
  {
    longitude, latitude, address
  }
) => `
DO $$
  DECLARE locationId integer;
  BEGIN
  INSERT INTO "Locations" ("latitude", "longitude", "createdAt", "updatedAt")
    SELECT '${latitude}', '${longitude}', NOW(), NOW()
      FROM  "Locations"
      WHERE NOT EXISTS (
        SELECT "latitude","longitude"
         FROM "Locations" 
         WHERE "latitude" ='${latitude}' AND "longitude"='${longitude}'
      )
    LIMIT 1;
  SELECT id INTO locationId
    FROM "Locations"
    WHERE "latitude"='${latitude}' AND "longitude"='${longitude}';
  INSERT INTO "Addresses" ("locationId", "address","homebaseId",  "createdAt", "updatedAt")
   VALUES ( locationId,'${address}','${homebaseId}', NOW(), NOW())
   ON CONFLICT("address") DO UPDATE SET "homebaseId" = '${homebaseId}';
 END $$`;


const homebases = [
  {
    name: 'Nairobi',
    locations: [
      {
        longitude: 36.886215,
        latitude: -1.219539,
        address: 'Andela Nairobi',
        createdAt: '2019-04-09',
        updatedAt: '2019-05-08 10:00:00.326000'
      },
      {
        longitude: 36.886215,
        latitude: -1.219539,
        address: 'Epic Tower'
      },
      {
        longitude: 36.7848955,
        latitude: -1.2519367,
        address: 'VFS Centre',
        createdAt: '2019-04-09',
        updatedAt: '2019-05-08 10:00:00.326000'

      },
      {
        longitude: 36.8104947,
        latitude: -1.2343935,
        address: 'US Embassy',
        createdAt: '2019-04-09',
        updatedAt: '2019-05-08 10:00:00.326000'
      },
      {
        longitude: 36.9260693,
        latitude: -1.3227102,
        address: 'Jomo Kenyatta Airport',
        createdAt: '2019-04-09',
        updatedAt: '2019-05-08 10:00:00.326000'
      },
      {
        longitude: 36.8511383,
        latitude: -1.239622,
        address: 'Nairobi Guest House',
        createdAt: '2019-04-09',
        updatedAt: '2019-05-08 10:00:00.326000'
      },
      {
        longitude: 36.879841,
        latitude: -1.219918,
        address: 'Morningside Apartments USIU road',
        createdAt: '2019-04-09',
        updatedAt: '2019-05-08 10:00:00.326000'
      },
      {
        longitude: 36.883281,
        latitude: -1.226404,
        address: 'Safari Park Hotel',
        createdAt: '2019-04-09',
        updatedAt: '2019-05-08 10:00:00.326000'
      },
      {
        longitude: 36.838365,
        latitude: -1.214048,
        address: 'Lymack Suites',
        createdAt: '2019-04-09',
        updatedAt: '2019-05-08 10:00:00.326000'
      }
    ]
  },
  {
    name: 'Kampala',
    locations: [
      {
        longitude: 32.626282,
        latitude: 0.379828,
        address: 'Najjera',
        createdAt: '2019-04-09',
        updatedAt: '2019-05-08 10:00:00.326000'
      },
      {
        longitude: 32.443930,
        latitude: 0.045382,
        address: 'Entebbe Airport',
        createdAt: '2019-04-09',
        updatedAt: '2019-05-08 10:00:00.326000'
      },
      {
        longitude: 32.592348,
        latitude: 0.299964,
        address: 'US Embassy Kampala',
        createdAt: '2019-04-09',
        updatedAt: '2019-05-08 10:00:00.326000'

      },
      {
        longitude: 32.5893855,
        latitude: 0.3427609,
        address: 'Andela Kampala',
        createdAt: '2019-04-09',
        updatedAt: '2019-05-08 10:00:00.326000'
      },
      {
        longitude: 32.5944254,
        latitude: 0.3636539,
        address: 'Kisasi',
        createdAt: '2019-04-09',
        updatedAt: '2019-05-08 10:00:00.326000'
      },
      {
        longitude: 32.611807,
        latitude: 0.3166228,
        address: 'Fusion Arena',
        createdAt: '2019-04-09',
        updatedAt: '2019-05-08 10:00:00.326000'
      },
      {
        longitude: 32.5727795,
        latitude: 0.3189207,
        address: 'Watoto Church',
        createdAt: '2019-04-09',
        updatedAt: '2019-05-08 10:00:00.326000'
      },
      {
        longitude: 32.5888808,
        latitude: 0.320358,
        address: 'Garden City',
        createdAt: '2019-04-09',
        updatedAt: '2019-05-08 10:00:00.326000'
      },
      {
        longitude: 32.5826399,
        latitude: 0.3251655,
        address: 'Golden Tulip',
        createdAt: '2019-04-09',
        updatedAt: '2019-05-08 10:00:00.326000'
      }
    ]
  },
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Addresses', 'homebaseId', {
      type: Sequelize.INTEGER
    });

    const defaultLocations = homebases.map(async (h) => {
      const [[{ id }]] = await queryInterface.sequelize.query(
        `select id from "Homebases" where name='${h.name}'`
      );

      homebaseId = id;
      h.locations.map((longitude, latitude, address) => {
        const sql = insertDefaultLocationsQuery(
          longitude, latitude, address
        );
        return queryInterface.sequelize.query(sql);
      });
    });
    await Promise.all(defaultLocations);
    await queryInterface.changeColumn('Addresses', 'homebaseId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Homebases',
        key: 'id',
        as: 'homebase'
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('Addresses', 'homebaseId');
  }
};

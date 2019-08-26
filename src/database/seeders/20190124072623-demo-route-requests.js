const engagementQuery = ({
  homebaseId1, homebaseId2, busStopId1, busStopId2,
}) => `
DO $$
DECLARE managerId integer;
DECLARE fellowId integer;
DECLARE partnerId integer;
DECLARE engagementId integer;

BEGIN
SELECT id INTO fellowId FROM "Users" WHERE email = 'fellow.smith@email.com';
SELECT id INTO partnerId FROM "Partners" WHERE name ='New vision. KLA';
INSERT INTO "Engagements" ( "partnerId", "fellowId", "startDate", "endDate", "workHours", "createdAt", "updatedAt") 
VALUES (partnerId, fellowId,'2019-01-22','2019-05-22','13:00-22:00','2019-01-22','2019-01-22') RETURNING "id" INTO engagementId;
SELECT id INTO managerId FROM "Users" WHERE email = 'manager.smith@email.com';
INSERT INTO "RouteRequests" (
  "engagementId",
  "managerId",
  "busStopId",
  "homeId",
  "distance",
  "opsComment",
  "managerComment",
  "busStopDistance", 
  "routeImageUrl",
  "status",
  "createdAt",
  "updatedAt"
 ) VALUES 
 (
 engagementId,
 managerId, 
 '${busStopId1}',
  '${homebaseId1}',
  '2.0',
  'not yet okay',
  'okay',
   2.4,
   'https://s3-us-west-2.amazonaws.com/uw-s3-cdn/wp-content/uploads/sites/6/2017/01/04143600/Access-Map-screenshot1.jpg',
   'Pending',
    '2019-01-22 22:59:23.326000',
    '2019-01-22 22:59:23.326000'
 ),
  (
 engagementId,
 managerId, 
 '${busStopId2}',
  '${homebaseId2}',
  '2.0',
  'okay',
  'okay',
   2.4,
 'https://s3-us-west-2.amazonaws.com/uw-s3-cdn/wp-content/uploads/sites/6/2017/01/04143600/Access-Map-screenshot1.jpg',
  'Confirmed',
   '2019-01-22 22:59:23.326000',
    '2019-01-22 22:59:23.326000'
 );
END $$
`;

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Users', [
      {
        name: 'Manager Smith',
        slackId: 'UJNNS',
        email: 'manager.smith@email.com',
        createdAt: '2018-11-14',
        updatedAt: '2018-11-14'
      },
      {
        name: 'Fellow Smith',
        slackId: 'TYYDS',
        email: 'fellow.smith@email.com',
        createdAt: '2018-11-14',
        updatedAt: '2018-11-14'
      }
    ]);
    await queryInterface.bulkInsert('Partners', [
      {
        name: 'New vision. KLA',
        createdAt: '2019-07-28',
        updatedAt: '2019-07-28',
      }
    ]);

    await queryInterface.sequelize.query(
      'select "id", "homebaseId" from "Addresses" LIMIT 2'
    ).then(async (response) => {
      const [
        [
          { id: busStopId1, homebaseId: homebaseId1 },
          { id: busStopId2, homebaseId: homebaseId2 }
        ]
      ] = response;

      const sql = engagementQuery({
        homebaseId1, homebaseId2, busStopId1, busStopId2,
      });
      await queryInterface.sequelize.query(sql);
    });
  },


  down: (queryInterface) => queryInterface.bulkDelete('RouteRequests', null, {})
};

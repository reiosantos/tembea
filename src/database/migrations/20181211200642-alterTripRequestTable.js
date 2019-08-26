module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.addColumn('TripRequests', 'tripType', {
      allowNull: false,
      type: Sequelize.ENUM(
        'Regular Trip',
        'Airport Transfer',
        'Embassy Visit'
      ),
      defaultValue: 'Regular Trip'
    }),
    queryInterface.addColumn('TripRequests', 'tripDetailId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'TripDetails',
        key: 'id',
        as: 'tripDetail'
      }
    })
  ]),

  down: (queryInterface) => Promise.all([
    queryInterface.removeColumn('TripRequests', 'tripType'),
    queryInterface.removeColumn('TripRequests', 'tripDetailId'),
    queryInterface.sequelize.query('DROP TYPE "enum_TripRequests_tripType";')
  ])
};

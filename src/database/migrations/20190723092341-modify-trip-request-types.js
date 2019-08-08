/* eslint-disable no-unused-vars,arrow-body-style */
const replaceEnum = require('sequelize-replace-enum-postgres').default;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return replaceEnum({
      queryInterface,
      tableName: 'TripRequests',
      columnName: 'tripType',
      defaultValue: 'Regular Trip',
      newValues: [
        'Regular Trip',
        'Airport Transfer',
        'Embassy Visit',
        'Route Trip'
      ],
      enumName: 'enum_TripRequests_tripType'
    });
  },
  down: (queryInterface, Sequelize) => {
    return replaceEnum({
      queryInterface,
      tableName: 'TripRequests',
      columnName: 'tripType',
      defaultValue: 'Regular Trip',
      newValues: [
        'Regular Trip',
        'Airport Transfer',
        'Embassy Visit'
      ],
      enumName: 'enum_TripRequests_tripType'
    });
  }
};

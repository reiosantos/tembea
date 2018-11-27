const replaceEnum = require('sequelize-replace-enum-postgres').default;

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn('TripRequests', 'departmentId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Departments',
        key: 'id',
        as: 'department',
      }
    });
    queryInterface.addColumn('TripRequests', 'declinedById', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
        as: 'declinedBy',
      }
    });
    queryInterface.addColumn('TripRequests', 'managerComment', {
      type: Sequelize.TEXT
    });
    return replaceEnum({
      queryInterface,
      tableName: 'TripRequests',
      columnName: 'tripStatus',
      defaultValue: 'Pending',
      newValues: ['Pending',
        'Approved',
        'DeclinedByManager',
        'DeclinedByOps',
        'Confirmed',
        'InTransit',
        'Cancelled',
        'Completed'],
      enumName: 'enum_TripRequests_tripStatus'
    });
  },

  down: (queryInterface) => {
    queryInterface.removeColumn('TripRequests', 'departmentId');
    queryInterface.removeColumn('TripRequests', 'declinedById');
    queryInterface.removeColumn('TripRequests', 'managerComment');
    return replaceEnum({
      queryInterface,
      tableName: 'TripRequests',
      columnName: 'tripStatus',
      defaultValue: 'Pending',
      newValues: ['Pending',
        'Approved',
        'DeclinedByManager',
        'DeclinedByOps',
        'Confirmed',
        'InTransit',
        'Cancelled',
        'Completed'],
      enumName: 'enum_TripRequests_tripStatus'
    });
  }
};

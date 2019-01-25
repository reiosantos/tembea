
module.exports = (sequelize, DataTypes) => {
  const RouteRequest = sequelize.define('RouteRequest', {
    distance: DataTypes.DOUBLE,
    opsComment: DataTypes.STRING,
    managerComment: DataTypes.STRING,
    engagementId: DataTypes.INTEGER,
    managerId: DataTypes.INTEGER,
    busStopId: DataTypes.INTEGER,
    homeId: DataTypes.INTEGER,
    busStopDistance: DataTypes.DOUBLE,
    routeImageUrl: DataTypes.TEXT,
    status: {
      allowNull: false,
      type: DataTypes.ENUM(
        'Pending',
        'Approved',
        'Declined',
        'Confirmed',
      ),
    },
  }, {});
  RouteRequest.associate = (models) => {
    // associations can be defined here
    RouteRequest.belongsTo(models.Engagement, {
      foreignKey: 'engagementId',
      targetKey: 'id',
      as: 'engagement',
    });
    RouteRequest.belongsTo(models.User, {
      foreignKey: 'managerId',
      targetKey: 'id',
      as: 'manager',
    });
    RouteRequest.belongsTo(models.Address, {
      foreignKey: 'busStopId',
      targetKey: 'id',
      as: 'busStop',
    });
    RouteRequest.belongsTo(models.Address, {
      foreignKey: 'homeId',
      targetKey: 'id',
      as: 'home',
    });
  };
  return RouteRequest;
};

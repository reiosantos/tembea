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
    opsReviewerId: DataTypes.INTEGER
  }, {});
  RouteRequest.associate = (models) => {
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
    RouteRequest.belongsTo(models.User, {
      foreignKey: 'opsReviewerId',
      targetKey: 'id',
      as: 'opsReviewer',
    });
    RouteRequest.belongsTo(models.User, {
      foreignKey: 'requesterId',
      targetKey: 'id',
      as: 'requester',
    });
    RouteRequest.belongsTo(models.Homebase, {
      foreignKey: 'homebaseId',
      targetKey: 'id',
      as: 'homebase',
    });
  };
  return RouteRequest;
};

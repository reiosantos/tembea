module.exports = (sequelize, DataTypes) => {
  const Route = sequelize.define('Route', {
    name: DataTypes.STRING,
    imageUrl: DataTypes.TEXT
  }, {});
  Route.associate = (models) => {
    // associations can be defined here
    Route.hasMany(models.RouteBatch, {
      foreignKey: 'routeId',
      as: 'routeBatch'
    });
    Route.belongsTo(models.Address, {
      foreignKey: 'destinationId',
      targetKey: 'id',
      as: 'destination',
    });
    Route.belongsTo(models.Homebase, {
      foreignKey: 'homebaseId',
      as: 'homebase'
    });
  };
  return Route;
};

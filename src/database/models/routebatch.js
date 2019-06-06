module.exports = (sequelize, DataTypes) => {
  const RouteBatch = sequelize.define('RouteBatch', {
    inUse: DataTypes.INTEGER,
    takeOff: DataTypes.STRING,
    batch: DataTypes.STRING,
    capacity: DataTypes.INTEGER,
    status: {
      allowNull: false,
      type: DataTypes.ENUM(
        'Active',
        'Inactive',
      ),
      defaultValue: 'Inactive'
    },
    comments: DataTypes.TEXT,
  }, {
    paranoid: true,
    timestamps: true
  });
  RouteBatch.associate = (model) => {
    // associations can be defined here
    RouteBatch.hasMany(model.User, {
      foreignKey: 'routeBatchId',
      as: 'riders'
    });

    RouteBatch.belongsTo(model.Route, {
      foreignKey: 'routeId',
      targetKey: 'id',
      as: 'route',
    });

    RouteBatch.belongsTo(model.Cab, {
      foreignKey: 'cabId',
      targetKey: 'id',
      as: 'cabDetails',
    });
    RouteBatch.belongsTo(model.Driver, {
      foreignKey: 'driverId',
      targetKey: 'id',
      as: 'driver',
    });
  };
  return RouteBatch;
};

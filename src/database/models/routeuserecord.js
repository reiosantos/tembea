

module.exports = (sequelize, DataTypes) => {
  const RouteUseRecord = sequelize.define('RouteUseRecord', {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    batchId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    confirmedUsers: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    unConfirmedUsers: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    skippedUsers: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    pendingUsers: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    batchUseDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {});
  RouteUseRecord.associate = (models) => {
    // associations can be defined here
    RouteUseRecord.belongsTo(models.RouteBatch, {
      foreignKey: 'batchId',
      targetKey: 'id',
      as: 'batch',
    });
  };
  return RouteUseRecord;
};

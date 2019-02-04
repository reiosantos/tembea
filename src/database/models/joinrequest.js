module.exports = (sequelize, DataTypes) => {
  const JoinRequest = sequelize.define('JoinRequest', {
    engagementId: DataTypes.INTEGER,
    managerId: DataTypes.INTEGER,
    managerComment: DataTypes.STRING,
    routeBatchId: DataTypes.INTEGER,
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
  JoinRequest.associate = (models) => {
    // associations can be defined here
    JoinRequest.belongsTo(models.Engagement, {
      foreignKey: 'engagementId',
      targetKey: 'id',
      as: 'engagement',
    });
    JoinRequest.belongsTo(models.User, {
      foreignKey: 'managerId',
      targetKey: 'id',
      as: 'manager',
    });
    JoinRequest.belongsTo(models.RouteBatch, {
      foreignKey: 'routeBatchId',
      targetKey: 'id',
      as: 'routeBatch',
    });
  };
  return JoinRequest;
};

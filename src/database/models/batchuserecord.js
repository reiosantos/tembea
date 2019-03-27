

module.exports = (sequelize, DataTypes) => {
  const BatchUseRecord = sequelize.define('BatchUseRecord', {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    batchRecordId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userAttendStatus: {
      allowNull: false,
      type: DataTypes.ENUM(
        'NotConfirmed',
        'Confirmed',
        'Skip',
        'Pending'
      ),
      defaultValue: 'NotConfirmed'
    },
    reasonForSkip: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

  }, {});
  BatchUseRecord.associate = (models) => {
    // associations can be defined here
    BatchUseRecord.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
      as: 'user',
    });
    BatchUseRecord.belongsTo(models.RouteUseRecord, {
      foreignKey: 'batchRecordId',
      targetKey: 'id',
      as: 'batchRecord',
    });
  };
  return BatchUseRecord;
};


module.exports = (sequelize, DataTypes) => {
  const Driver = sequelize.define('Driver', {
    driverName: {
      type: DataTypes.STRING,
    },
    driverPhoneNo: {
      type: DataTypes.STRING,
    },
    driverNumber: {
      type: DataTypes.STRING,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    providerId: DataTypes.INTEGER,
    email: DataTypes.STRING
  }, {
    paranoid: true,
    timestamps: true
  });
  Driver.associate = (models) => {
    Driver.belongsTo(models.Provider, {
      foreignKey: 'providerId',
      key: 'provider'
    });
    Driver.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };
  return Driver;
};

module.exports = (sequelize, DataTypes) => {
  const Cab = sequelize.define('Cab', {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    driverName: {
      type: DataTypes.STRING,
    },
    driverPhoneNo: {
      type: DataTypes.STRING,
    },
    regNumber: {
      type: DataTypes.STRING,
    },
    capacity: {
      type: DataTypes.INTEGER,
    },
    model: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.STRING,
    },
    providerId: {
      type: DataTypes.INTEGER
    }
  }, {
      paranoid: true,
      timestamps: true
    });
  Cab.associate = (models) => {
    Cab.belongsTo(models.Provider, {
      foreignKey: 'providerId',
      targetKey: 'id',
      as: 'provider',
    })
  };
  return Cab;
};

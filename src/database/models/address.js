module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    locationId: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
    address: {
      allowNull: false,
      unique: true,
      type: DataTypes.STRING,
    },
  }, {});
  Address.associate = (models) => {
    Address.hasMany(models.TripRequest, {
      foreignKey: 'originId'
    });
    Address.hasMany(models.TripRequest, {
      foreignKey: 'destinationId'
    });
    Address.belongsTo(models.Location, {
      foreignKey: 'locationId',
      targetKey: 'id',
      as: 'location'
    });
  };
  return Address;
};

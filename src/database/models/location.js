module.exports = (sequelize, DataTypes) => {
  const Location = sequelize.define('Locations', {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },
    longitude: {
      allowNull: false,
      type: DataTypes.DOUBLE,
    },
    latitude: {
      allowNull: false,
      type: DataTypes.DOUBLE,
    },
  }, {});
  Location.associate = (models) => {
    Location.belongsTo(models.Address, {
      foreignKey: 'id'
    });
  };
  return Location;
};

module.exports = (sequelize, DataTypes) => {
  const Cab = sequelize.define('Cab', {
    id: {
      allowNull: false,
      primaryKey: true,
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
  }, {});
  Cab.associate = (models) => {
  };
  return Cab;
};

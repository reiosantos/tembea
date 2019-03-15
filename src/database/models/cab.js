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
    }
  }, {});
  Cab.associate = () => {
  };
  return Cab;
};

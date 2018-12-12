module.exports = (sequelize, DataTypes) => {
  const TripDetail = sequelize.define('TripDetail', {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },
    riderPhoneNo: DataTypes.STRING,
    travelTeamPhoneNo: DataTypes.STRING,
    flightNumber: DataTypes.STRING
  }, {});
  return TripDetail;
};

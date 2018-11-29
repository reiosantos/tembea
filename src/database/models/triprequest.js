module.exports = (sequelize, DataTypes) => {
  const TripRequest = sequelize.define('TripRequest', {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    riderId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    tripStatus: {
      allowNull: false,
      type: DataTypes.ENUM(
        'Pending', 'Approved', 'Confirmed', 'InTransit', 'Cancelled', 'Completed'
      ),
    },
    originId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    destinationId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    cost: {
      type: DataTypes.DECIMAL,
    },
    departureTime: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    arrivalTime: {
      type: DataTypes.STRING,
    },
    requestedById: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    approvedById: {
      type: DataTypes.INTEGER,
    },
    confirmedById: {
      type: DataTypes.INTEGER,
    },
    cabId: {
      type: DataTypes.INTEGER,
    }
  }, {});
  TripRequest.associate = (models) => {
    TripRequest.belongsTo(models.User, {
      foreignKey: 'requestedById',
      targetKey: 'id',
      as: 'requester',
    });
    TripRequest.hasOne(models.Cab, {
      foreignKey: 'id',
      targetKey: 'cabId',
      as: 'cab'
    });
    TripRequest.hasOne(models.Address, {
      foreignKey: 'id',
      targetKey: 'originId',
      as: 'origin'
    });
    TripRequest.hasOne(models.Address, {
      foreignKey: 'id',
      targetKey: 'destinationId',
      as: 'destination'
    });
    TripRequest.hasOne(models.User, {
      foreignKey: 'id',
      targetKey: 'riderId',
      as: 'rider'
    });
  };
  return TripRequest;
};

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
    reason: {
      allowNull: false,
      type: DataTypes.TEXT,
    },
    riderId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    noOfPassengers: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    departmentId: {
      type: DataTypes.INTEGER,
    },
    tripStatus: {
      allowNull: false,
      type: DataTypes.ENUM(
        'Pending', 'Approved', 'Confirmed', 'InTransit', 'Cancelled', 'Completed', 'DeclinedByOps'
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
    declinedById: {
      type: DataTypes.INTEGER,
    },
    operationsComment: {
      type: DataTypes.STRING,
    },
    cabId: {
      type: DataTypes.INTEGER,
    },
    managerComment: {
      type: DataTypes.TEXT
    }
  }, {});
  TripRequest.associate = (models) => {
    TripRequest.belongsTo(models.User, {
      foreignKey: 'requestedById',
      targetKey: 'id',
      as: 'requester',
    });
    TripRequest.belongsTo(models.Address, {
      foreignKey: 'originId',
      targetKey: 'id',
      as: 'origin'
    });
    TripRequest.belongsTo(models.Address, {
      foreignKey: 'destinationId',
      targetKey: 'id',
      as: 'destination'
    });
    TripRequest.belongsTo(models.User, {
      foreignKey: 'riderId',
      targetKey: 'id',
      as: 'rider'
    });
    TripRequest.belongsTo(models.User, {
      foreignKey: 'declinedById',
      targetKey: 'id',
      as: 'decliner'
    });
    TripRequest.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      targetKey: 'id',
      as: 'department'
    });
  };
  return TripRequest;
};

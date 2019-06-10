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
    tripType: {
      allowNull: false,
      type: DataTypes.ENUM(
        'RegularTrip',
        'AirportTransfer',
        'EmbassyVisit'
      )
    },
    tripDetailId: {
      type: DataTypes.INTEGER
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
    distance: {
      type: DataTypes.STRING,
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
    tripNote: {
      type: DataTypes.TEXT
    },
    managerComment: {
      type: DataTypes.TEXT
    },
    rating: {
      type: DataTypes.INTEGER
    },
    tripNotTakenReason: {
      type: DataTypes.TEXT
    },
    driverId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Drivers',
        key: 'id',
      },
    },
    providerId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Providers',
        key: 'id',
      },
    },
    approvalDate: {
      type: DataTypes.STRING
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
    TripRequest.belongsTo(models.Cab, {
      foreignKey: 'cabId',
      targetKey: 'id',
      as: 'cab'
    });
    TripRequest.belongsTo(models.User, {
      foreignKey: 'approvedById',
      targetKey: 'id',
      as: 'approver'
    });
    TripRequest.belongsTo(models.User, {
      foreignKey: 'confirmedById',
      targetKey: 'id',
      as: 'confirmer'
    });
    TripRequest.belongsTo(models.TripDetail, {
      foreignKey: 'tripDetailId',
      targetKey: 'id',
      as: 'tripDetail'
    });
    TripRequest.belongsTo(models.Driver, {
      foreignKey: 'driverId',
      targetKey: 'id',
      as: 'driver'
    });
    TripRequest.belongsTo(models.Provider, {
      foreignKey: 'providerId',
      targetKey: 'id',
      as: 'provider'
    });
  };
  return TripRequest;
};

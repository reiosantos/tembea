module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
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
    slackId: {
      allowNull: false,
      unique: true,
      type: DataTypes.STRING,
    },
    phoneNo: {
      unique: true,
      allowNull: true,
      type: DataTypes.STRING,
    },
    email: {
      unique: true,
      type: DataTypes.STRING,
    },
    defaultDestinationId: {
      allowNull: true,
      type: DataTypes.INTEGER,
    }
  }, {});
  User.associate = (models) => {
    User.hasMany(models.TripRequest, {
      foreignKey: 'requestedById',
      sourceKey: 'id'
    });
    User.hasOne(models.Address, {
      foreignKey: 'id',
      targetKey: 'defaultDestinationId',
      as: 'defaultDestination',
    });
  };
  return User;
};

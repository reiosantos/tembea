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
    },
    routeBatchId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'RouteBatches',
        key: 'id',
        as: 'routeBatch'
      },
    },
    homebaseId: {
      type: DataTypes.INTEGER
    },
  }, {});
  User.associate = (models) => {
    User.hasMany(models.TripRequest, {
      foreignKey: 'requestedById',
      sourceKey: 'id'
    });
    User.belongsToMany(models.Partner, { through: 'Engagements', foreignKey: 'userId' });
    User.belongsToMany(models.Role, {
      as: 'roles',
      through: 'UserRole',
      foreignKey: 'userId',
    });
  };

  return User;
};

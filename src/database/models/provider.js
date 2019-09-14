module.exports = (sequelize, DataTypes) => {
  const Provider = sequelize.define('Provider', {
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
    providerUserId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    isDirectMessage: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    channelId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    paranoid: true,
    timestamps: true
  });
  Provider.associate = (models) => {
    Provider.hasMany(models.Cab, {
      foreignKey: 'providerId',
      as: 'vehicles'
    });
    Provider.belongsTo(models.User, {
      foreignKey: 'providerUserId',
      as: 'user'
    });
    Provider.hasMany(models.Driver, {
      foreignKey: 'providerId',
      as: 'drivers'
    });
    Provider.belongsTo(models.Homebase, {
      foreignKey: 'homebaseId',
      targetKey: 'id',
      as: 'homebase'
    });
  };
  return Provider;
};

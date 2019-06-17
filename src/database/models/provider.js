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
    }
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
  };
  return Provider;
};

module.exports = (sequelize, DataTypes) => {
  const Homebase = sequelize.define('Homebase', {
    name: {
      unique: true,
      type: DataTypes.STRING,
    },
    countryId: {
      type: DataTypes.INTEGER,
    },
    channel: {
      type: DataTypes.STRING,
    }
  }, {
    paranoid: true,
    timestamps: true
  });
  Homebase.associate = (models) => {
    Homebase.belongsTo(models.Country, {
      foreignKey: 'countryId',
      targetKey: 'id',
      as: 'country',
      onDelete: 'cascade',
      hooks: true
    });
    Homebase.hasMany(models.User, {
      foreignKey: 'homebaseId',
      as: 'users'
    });
  };
  return Homebase;
};

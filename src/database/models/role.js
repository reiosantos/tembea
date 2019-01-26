module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    name: {
      allowNull: false,
      unique: true,
      type: DataTypes.STRING,
    },
  }, {});
  Role.associate = (models) => {
    Role.belongsToMany(models.User, {
      as: 'users',
      through: 'UserRole',
      foreignKey: 'roleId',
    });
  };
  return Role;
};

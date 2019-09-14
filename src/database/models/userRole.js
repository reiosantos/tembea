module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define('UserRole', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    homebaseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Homebases',
        key: 'id'
      }
    }
  });
  
  UserRole.associate = (models) => {
    UserRole.belongsTo(models.Homebase, {
      foreignKey: 'homebaseId'
    });
    UserRole.belongsTo(models.Role, {
      foreignKey: 'roleId'
    });
  };
  return UserRole;
};

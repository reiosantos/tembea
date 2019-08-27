module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define('Department', {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },
    name: {
      unique: true,
      type: DataTypes.STRING,
    },
    headId: {
      type: DataTypes.INTEGER,
    },
    teamId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      allowNull: false,
      defaultValue: 'Active',
      type: DataTypes.ENUM(
        'Active',
        'Inactive'
      )
    },
  }, {
    defaultScope: {
      where: {
        status: 'Active'
      }
    },
    scopes: {
      all: {
        where: {
          status: { [sequelize.Op.or]: ['Active', 'Inactive'] }
        }
      },
      inactive: {
        where: {
          status: 'Inactive'
        }
      }
    },
    homebaseId: {
      type: DataTypes.INTEGER
    },
  });
  Department.associate = (models) => {
    Department.belongsTo(models.User, {
      foreignKey: 'headId',
      targetKey: 'id',
      as: 'head',
    });
    Department.belongsTo(models.Homebase, {
      foreignKey: 'homebaseId',
      as: 'homebase'
    });
  };
  return Department;
};

module.exports = (sequelize, DataTypes) => {
  const Country = sequelize.define('Country', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      unique: true,
      type: DataTypes.STRING,
    },
    status: {
      allowNull: false,
      defaultValue: 'Active',
      type: DataTypes.ENUM(
        'Active',
        'Inactive'
      )
    }
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
    }
  });
  return Country;
};

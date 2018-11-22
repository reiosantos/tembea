module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define('Departments', {
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
  }, {});
  Department.associate = (models) => {
  };
  return Department;
};

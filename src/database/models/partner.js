
module.exports = (sequelize, DataTypes) => {
  const partner = sequelize.define('Partner', {
    name: DataTypes.STRING
  }, {});
  partner.associate = (models) => {
    // associations can be defined here
    partner.belongsToMany(models.User, { through: 'Engagements', foreignKey: 'partnerId' });
  };
  return partner;
};

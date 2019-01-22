module.exports = (sequelize, DataTypes) => {
  const Engagement = sequelize.define('Engagement',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
      },
      partnerId: {
        type: DataTypes.INTEGER,
      },
      fellowId: {
        type: DataTypes.INTEGER,
      },
      startDate: DataTypes.STRING,
      endDate: DataTypes.STRING,
      workHours: DataTypes.STRING
    }, {});

  // UserPartner.removeAttribute('id');
  Engagement.associate = (models) => {
    // associations can be defined here
    Engagement.belongsTo(models.User, {
      foreignKey: 'fellowId',
      targetKey: 'id',
      as: 'fellow',
    });
    Engagement.belongsTo(models.Partner, {
      foreignKey: 'partnerId',
      targetKey: 'id',
      as: 'partner',
    });
  };
  return Engagement;
};

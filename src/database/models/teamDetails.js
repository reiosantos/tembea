module.exports = (sequelize, DataTypes) => {
  const TeamDetails = sequelize.define('TeamDetails', {
    teamId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING
    },
    botId: {
      unique: true,
      type: DataTypes.STRING,
      allowNull: false,
    },
    botToken: {
      unique: true,
      type: DataTypes.STRING,
      allowNull: false,
    },
    teamName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    teamUrl: {
      unique: true,
      type: DataTypes.STRING,
      allowNull: false,
    },
    webhookConfigUrl: {
      unique: true,
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      unique: true,
      type: DataTypes.STRING,
      allowNull: false,
    },
    userToken: {
      unique: true,
      type: DataTypes.STRING,
      allowNull: false,
    },
    opsChannelId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  TeamDetails.associate = (models) => {
    TeamDetails.hasMany(models.Department, {
      foreignKey: 'teamId'
    });
  };
  return TeamDetails;
};

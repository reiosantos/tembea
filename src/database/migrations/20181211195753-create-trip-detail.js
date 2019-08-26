module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('TripDetails', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    riderPhoneNo: {
      type: Sequelize.STRING
    },
    travelTeamPhoneNo: {
      type: Sequelize.STRING
    },
    flightNumber: {
      type: Sequelize.STRING
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  }),
  down: (queryInterface) => queryInterface.dropTable('TripDetails')
};

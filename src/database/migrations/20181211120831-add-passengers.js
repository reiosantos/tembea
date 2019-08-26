module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    // Add number of noOfPassengers column
    'TripRequests',
    'noOfPassengers',
    {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  ),
  down: (queryInterface) => queryInterface.removeColumn(
    'TripRequests',
    'noOfPassengers',
  )
};

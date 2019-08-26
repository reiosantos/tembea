module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('RouteRequests', 'opsReviewerId', {
    allowNull: true,
    type: Sequelize.INTEGER,
    references: {
      model: 'Users',
      key: 'id',
      as: 'opsReviewer'
    }
  }),

  down: (queryInterface) => queryInterface.removeColumn('RouteRequests', 'opsReviewerId')
};

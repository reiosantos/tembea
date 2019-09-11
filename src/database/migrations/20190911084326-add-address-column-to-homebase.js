module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Homebases', 'addressId', {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'Addresses',
      key: 'id',
      as: 'address'
    }
  }),

  down: (queryInterface) => queryInterface.removeColumn('Homebases', 'addressId')
};


module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    // modify country defaults
    queryInterface.changeColumn('Countries', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('NOW()')
    }),
    queryInterface.changeColumn('Countries', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('NOW()')
    }),
    // modify homebase defaults
    queryInterface.changeColumn('Homebases', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('NOW()')
    }),
    queryInterface.changeColumn('Homebases', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('NOW()')
    })]),

  down: (queryInterface, Sequelize) => Promise.all([
    // modify country defaults
    queryInterface.changeColumn('Countries', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false
    }),
    queryInterface.changeColumn('Countries', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: true
    }),
    // modify homebase defaults
    queryInterface.changeColumn('Homebases', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false
    }),
    queryInterface.changeColumn('Homebases', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: true
    })])
};

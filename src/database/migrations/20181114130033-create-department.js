module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Departments', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    name: {
      unique: true,
      type: Sequelize.STRING,
    },
    headId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
        as: 'head',
      }
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    }
  }),
  down: (queryInterface) => queryInterface.dropTable('Departments'),
};

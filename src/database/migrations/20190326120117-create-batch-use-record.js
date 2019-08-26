
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('BatchUseRecords', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
        as: 'user'
      }
    },
    batchRecordId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'RouteUseRecords',
        key: 'id',
        as: 'batchUse'
      }
    },
    userAttendStatus: {
      allowNull: false,
      type: Sequelize.ENUM(
        'NotConfirmed',
        'Confirmed',
        'Skip',
        'Pending'
      ),
      defaultValue: 'NotConfirmed'
    },
    reasonForSkip: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    rating: {
      type: Sequelize.INTEGER,
      allowNull: true,
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
  down: (queryInterface) => queryInterface.dropTable('BatchUseRecords')
};

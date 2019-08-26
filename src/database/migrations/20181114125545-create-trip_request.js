module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('TripRequests', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    name: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    riderId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
        as: 'rider'
      }
    },
    tripStatus: {
      allowNull: false,
      type: Sequelize.ENUM(
        'Pending',
        'Approved',
        'Confirmed',
        'InTransit',
        'Cancelled',
        'Completed'
      ),
      defaultValue: 'Pending'
    },
    originId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'Addresses',
        key: 'id',
        as: 'origin'
      }
    },
    destinationId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'Addresses',
        key: 'id',
        as: 'destination',
      }
    },
    cost: {
      type: Sequelize.DECIMAL
    },
    departureTime: {
      allowNull: false,
      type: Sequelize.STRING
    },
    arrivalTime: {
      type: Sequelize.STRING
    },
    requestedById: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
        as: 'requester',
      }
    },
    approvedById: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
        as: 'approver',
      }
    },
    confirmedById: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
        as: 'confirmer',
      }
    },
    cabId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Cabs',
        key: 'id',
        as: 'cab',
      }
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
  down: (queryInterface) => queryInterface.dropTable('TripRequests'),
};

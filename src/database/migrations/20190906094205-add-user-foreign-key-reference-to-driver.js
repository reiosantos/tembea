
module.exports = {
  up: (queryInterface) => queryInterface.addConstraint('Drivers', ['userId'], {
    type: 'FOREIGN KEY',
    name: 'userid_fk',
    references: {
      table: 'Users',
      field: 'id',
    },
    onDelete: 'restrict',
    onUpdate: 'restrict',
  }),
  down: (queryInterface) => queryInterface.removeConstraint('Drivers', 'userid_fk')

};

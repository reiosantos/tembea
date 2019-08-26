module.exports = {
  up: (queryInterface) => queryInterface.addConstraint('Addresses', ['address'], {
    type: 'unique',
    name: 'address_unique'
  }),
  down: (queryInterface) => queryInterface.removeConstraint('Addresses', 'address_unique')
};

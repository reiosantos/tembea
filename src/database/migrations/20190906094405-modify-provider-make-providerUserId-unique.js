
module.exports = {
  up: (queryInterface) => queryInterface.addConstraint('Providers', ['providerUserId'], {
    type: 'unique',
    name: 'user_unique'
  }),
  down: (queryInterface) => queryInterface.removeConstraint('Providers', 'user_unique')
};

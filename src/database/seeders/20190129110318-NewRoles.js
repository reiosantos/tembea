module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Roles', [
    {
      name: 'Super Admin',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14'
    },
    {
      name: 'Admin',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14'
    }
  ]),
  down: (queryInterface) => queryInterface.bulkDelete('Roles')
};

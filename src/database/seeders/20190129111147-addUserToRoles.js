module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('UserRoles', [
    {
      userId: 11,
      roleId: 1,
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14'
    },
    {
      userId: 11,
      roleId: 2,
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14'
    },
  ]),
  down: (queryInterface) => queryInterface.bulkDelete('UserRoles')
};

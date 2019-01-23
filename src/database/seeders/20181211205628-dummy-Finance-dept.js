module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Departments', [{
    name: 'Finance-demo',
    headId: 10,
    teamId: 'TE2K8PGF8',
    createdAt: '2018-12-11',
    updatedAt: '2018-12-11'
  }]),
  down: queryInterface => queryInterface.bulkDelete('Departments')
};

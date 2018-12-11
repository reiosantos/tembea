module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Departments', [{
    name: 'Finance-demo',
    headId: 10,
    createdAt: '2018-12-11',
    updatedAt: '2018-12-11'
  }]),
  down: queryInterface => queryInterface.bulkDelete('Departments')
};

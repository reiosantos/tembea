module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Departments', [{
    name: 'TDD',
    headId: 3,
    createdAt: '2018-11-28',
    updatedAt: '2018-11-28'
  }, {
    name: 'Travel',
    headId: 4,
    createdAt: '2018-11-28',
    updatedAt: '2018-11-28'
  }, {
    name: 'People',
    headId: 6,
    createdAt: '2018-11-28',
    updatedAt: '2018-11-28'
  }], {}),

  down: queryInterface => queryInterface.bulkDelete('Departments', null, {})
};

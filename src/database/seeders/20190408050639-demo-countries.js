module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Countries', [{
    name: 'Kenya',
    createdAt: '2019-01-01',
    updatedAt: '2019-01-01'
  },
  {
    name: 'Uganda',
    createdAt: '2019-01-01',
    updatedAt: '2019-01-01'
  },
  {
    name: 'Nigeria',
    createdAt: '2019-01-01',
    updatedAt: '2019-01-01'
  },
  {
    name: 'Rwanda',
    createdAt: '2019-01-01',
    updatedAt: '2019-01-01'
  },
  {
    name: 'Egypt',
    createdAt: '2019-01-01',
    updatedAt: '2019-01-01'
  }],
  {}),
  down: queryInterface => queryInterface.bulkDelete('Countries', null, {})
};

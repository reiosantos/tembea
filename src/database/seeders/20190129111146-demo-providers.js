module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Providers', [{
    name: 'Uber Kenya',
    providerUserId: 1,
    createdAt: '2019-01-01',
    updatedAt: '2019-01-01'
  },
  {
    name: 'Taxify Kenya',
    providerUserId: 2,
    createdAt: '2019-01-01',
    updatedAt: '2019-01-01'
  },
  {
    name: 'Endesha Kenya',
    providerUserId: 3,
    createdAt: '2019-01-01',
    updatedAt: '2019-01-01'
  }
  ],
  {}),
  down: queryInterface => queryInterface.bulkDelete('Providers', null, {})
};

module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Addresses', [{
    locationId: 2001,
    address: 'Jomo Kenyatta Airport',
    createdAt: '2019-04-09',
    updatedAt: '2018-11-09'
  }, {
    locationId: 2002,
    address: 'VFS Centre',
    createdAt: '2019-04-09',
    updatedAt: '2018-11-09'
  },
  {
    locationId: 2003,
    address: 'US Embassy',
    createdAt: '2019-04-09',
    updatedAt: '2018-11-09'
  }, {
    locationId: 2004,
    address: 'Nairobi Guest House',
    createdAt: '2019-04-09',
    updatedAt: '2018-11-09'
  },
  {
    locationId: 2005,
    address: 'Andela Nairobi',
    createdAt: '2019-04-09',
    updatedAt: '2018-11-09'
  },
  ]),
  down: queryInterface => queryInterface.bulkDelete('Addresses')
};

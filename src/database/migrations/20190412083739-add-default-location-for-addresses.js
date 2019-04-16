module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Locations', [{
    id: 2001,
    longitude: 36.9260693,
    latitude: -1.3227102,
    createdAt: '2019-01-22 22:23:23.326000',
    updatedAt: '2019-01-22 22:45:25.006000'
  }, {
    id: 2002,
    longitude: 36.7848955,
    latitude: -1.2519367,
    createdAt: '2019-01-22 22:56:23.326000',
    updatedAt: '2019-01-22 22:52:25.006000'
  },
  {
    id: 2003,
    longitude: 36.8104947,
    latitude: -1.2343935,
    createdAt: '2019-01-22 22:57:23.326000',
    updatedAt: '2019-01-22 22:58:25.006000'
  }, {
    id: 2004,
    longitude: 36.8511383,
    latitude: -1.239622,
    createdAt: '2019-01-23 22:59:23.326000',
    updatedAt: '2019-01-24 22:59:25.006000'
  },
  {
    id: 2005,
    longitude: 36.886215,
    latitude: -1.219539,
    createdAt: '2019-01-22 22:59:23.326000',
    updatedAt: '2019-01-22 22:59:25.006000'
  },
  ]),
  down: () => Promise.resolve()
};

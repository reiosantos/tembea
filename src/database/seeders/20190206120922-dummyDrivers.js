module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Drivers', [{
    driverName: 'James Savali',
    driverPhoneNo: 708989098,
    driverNumber: 254234,
    email: 'savali@gmail.com',
    providerId: 1,
    createdAt: '2019-01-01',
    updatedAt: '2019-01-01'
  },
  {
    driverName: 'Muhwezi Deo',
    driverPhoneNo: 908989098,
    driverNumber: 254235,
    email: 'deo@gmail.com',
    providerId: 2,
    createdAt: '2019-01-01',
    updatedAt: '2019-01-01'
  },
  {
    driverName: 'Allan Mogusu',
    driverPhoneNo: 808989098,
    driverNumber: 254236,
    email: 'allan@gmail.com',
    providerId: 3,
    createdAt: '2019-01-01',
    updatedAt: '2019-01-01'
  }
  ],
  {}),
  down: (queryInterface) => queryInterface.bulkDelete('Drivers', null, {})
};

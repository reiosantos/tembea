const faker = require('faker');

module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Cabs', [
    {
      driverName: 'Dominic Toretto',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'SMK 319 JK',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14'
    },
    {
      driverName: 'Brian O\'Conner',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'LND 419 CN',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14'
    },
    {
      driverName: 'Tej Parker',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'IKR 409 KI',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14'
    },
    {
      driverName: 'Luke Hobbs',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'APP 519 DT',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14'
    }
  ]),
  down: queryInterface => queryInterface.bulkDelete('Cabs')
};

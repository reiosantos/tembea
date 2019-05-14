const faker = require('faker');

module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Cabs', [
    {
      driverName: 'Dominic Toretto',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'SMK 319 JK',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 4,
      providerId: 1,
      model: 'subaru',
      location: 'Lagos'
    },
    {
      driverName: 'Brian O\'Conner',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'LND 419 CN',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 4,
      model: 'toyota',
      providerId: 2,
      location: 'Wakanda'
    },
    {
      driverName: 'Tej Parker',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'IKR 409 KI',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 8,
      model: 'toyota',
      providerId: 3,
      location: 'Kampala'
    },
    {
      driverName: 'Luke Hobbs',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'APP 519 DT',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 4,
      model: 'prado',
      providerId: 1,
      location: 'Nairobi'
    },
    {
      driverName: 'Arlean Bogardus',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'SMI 319 JK',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 4,
      model: 'subaru',
      providerId: 1,
      location: 'Lagos'
    },
    {
      driverName: 'Sun Dickie',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'LNS 419 CN',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 4,
      model: 'toyota',
      providerId: 1,
      location: 'Wakanda'
    },
    {
      driverName: 'Leandro Suzuki',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'IKW 409 KI',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 8,
      model: 'Ford C-Max',
      providerId: 1,
      location: 'Kampala'
    },
    {
      driverName: 'Kimber Mchugh',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'APD 519 DT',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 4,
      model: 'prado',
      providerId: 1,
      location: 'Nairobi'
    },
    {
      driverName: 'Corazon Broman',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'SMK 319 JD',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 7,
      model: 'subaruFord Probe',
      providerId: 3,
      location: 'Lagos'
    },
    {
      driverName: 'Alonso Rush',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'SMK 319 JE',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 4,
      model: 'subaru',
      providerId: 2,
      location: 'Lagos'
    },
    {
      driverName: 'Vera Dvorak',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'LNX 419 CN',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 4,
      model: 'toyota',
      providerId: 2,
      location: 'Wakanda'
    },
    {
      driverName: 'Gil Ewan',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'SMK 319 JZ',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 6,
      model: 'Suzuki Esteem',
      providerId: 1,
      location: 'Lagos'
    },
    {
      driverName: 'Zada Strong',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'SMK 319 JB',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 9,
      model: 'Ford Escort',
      providerId: 1,
      location: 'Kampala'
    },
    {
      driverName: 'Candy Keatts',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'SMK 319 JJ',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 8,
      model: 'Audi e-Tron',
      providerId: 1,
      location: 'Wakanda'
    },
    {
      driverName: 'Jarod Kulesza',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'SMK 319 JG',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 7,
      model: 'subaruFord Probe',
      providerId: 2,
      location: 'Lagos'
    },
    {
      driverName: 'Asia Wamsley',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'SMK 314 JK',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 6,
      model: 'Suzuki Esteem',
      providerId: 3,
      location: 'Lagos'
    },
    {
      driverName: 'Kristal Moncayo',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'SMR 313 JK',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 4,
      model: 'Mitsubishi Mirage',
      providerId: 2,
      location: 'Lagos'
    },
    {
      driverName: 'Luella Sangster',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'SMK 319 J4',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 4,
      model: 'subaru',
      providerId: 3,
      location: 'Lagos'
    },
    {
      driverName: 'Rosann Paugh',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'LND 416 CO',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 4,
      model: 'toyota',
      providerId: 1,
      location: 'Wakanda'
    },
    {
      driverName: 'Juli Marrin',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'SMK 316 JP',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 5,
      model: 'Daihatsu Naked',
      providerId: 2,
      location: 'Lagos'
    },
    {
      driverName: 'Tabetha Kohout',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'SMK 314 JL',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 3,
      model: 'Chevrolet Citation',
      providerId: 1,
      location: 'Lagos'
    },
    {
      driverName: 'Berniece Boese',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'SMK 319 JU',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 7,
      model: 'subaruFord Probe',
      providerId: 2,
      location: 'Lagos'
    },
    {
      driverName: 'Lily Zulauf',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'SMI 312 EK',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 4,
      model: 'subaru',
      providerId: 1,
      location: 'Lagos'
    },
    {
      driverName: 'Hulda Patel',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'LNE 619 CS',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 4,
      model: 'toyota',
      providerId: 2,
      location: 'Wakanda'
    },
    {
      driverName: 'Terrie Monroe',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'SMG 719 EK',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 2,
      model: 'Mitsubishi Pajero',
      providerId: 3,
      location: 'Nairobi'
    },
    {
      driverName: 'Terry Monty',
      driverPhoneNo: faker.phone.phoneNumber(),
      regNumber: 'SMN 219 FK',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14',
      capacity: 2,
      model: 'Mitsubishi Pajero',
      providerId: 2,
      location: 'Nairobi'
    }
  ]),
  down: queryInterface => queryInterface.bulkDelete('Cabs')
};

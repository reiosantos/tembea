module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Cabs', [
    {
      driverName: 'Human Alien',
      driverPhoneNo: '+1234567890',
      regNumber: 'GGG 123A',
      createdAt: '2019-01-22 22:59:23.326000',
      updatedAt: '2019-01-22 22:59:23.326000'
    },
    {
      driverName: 'Ellen DeGeneres',
      driverPhoneNo: '+0987654321',
      regNumber: 'YOU GO GIRL!',
      createdAt: '2019-01-22 22:59:23.326000',
      updatedAt: '2019-01-22 22:59:23.326000'
    },
  ]),

  down: queryInterface => queryInterface.bulkDelete('Cabs', null, {})
};

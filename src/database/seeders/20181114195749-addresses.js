module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Addresses', [
    {
      locationId: 1,
      address: 'the dojo',
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      locationId: 2,
      address: 'Epic Tower',
      createdAt: '2018-11-15',
      updatedAt: '2018-11-15'
    }
  ]),
  down: queryInterface => queryInterface.bulkDelete('Addresses')
};

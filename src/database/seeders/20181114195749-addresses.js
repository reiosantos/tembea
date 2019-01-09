module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Addresses', [
    {
      address: 'the dojo',
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      address: 'Epic Tower',
      createdAt: '2018-11-15',
      updatedAt: '2018-11-15'
    }
  ]),
  down: queryInterface => queryInterface.bulkDelete('Addresses')
};

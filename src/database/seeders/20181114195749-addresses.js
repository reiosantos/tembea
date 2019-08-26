module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Addresses', [
    {
      locationId: 1,
      address: 'the dojo Nairobi',
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      locationId: 2,
      address: 'Epic Tower Nairobi',
      createdAt: '2018-11-15',
      updatedAt: '2018-11-15'
    }
  ]),
  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Addresses',
    {
      [Sequelize.Op.or]: [
        { address: 'the dojo Nairobi' },
        { address: 'Epic Tower Nairobi' }
      ]
    })
};

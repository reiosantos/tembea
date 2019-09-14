module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Partners', [
    {
      name: 'Partner Inc. NYC',
      createdAt: '2019-01-22',
      updatedAt: '2019-01-22'
    }
  ]),

  down: queryInterface => queryInterface.bulkDelete('Partners', null, {})
};

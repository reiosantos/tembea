module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Engagements', [
    {
      partnerId: 1,
      fellowId: 1,
      startDate: '2019-01-22',
      endDate: '2019-05-22',
      workHours: '13:00-22:00',
      createdAt: '2019-01-22',
      updatedAt: '2019-01-22'
    }
  ]),

  down: queryInterface => queryInterface.bulkDelete('Engagements', null, {})
};

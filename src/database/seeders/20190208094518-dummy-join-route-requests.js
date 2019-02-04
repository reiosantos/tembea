module.exports = {
  up: queryInterface => queryInterface.bulkInsert('JoinRequests', [
    {
      engagementId: 1,
      managerId: 2,
      managerComment: 'Yeah, sure.',
      routeBatchId: 1,
      status: 'Approved',
      createdAt: '2019-01-22 22:59:23.326000',
      updatedAt: '2019-01-22 22:59:23.326000'
    }
  ]),

  down: queryInterface => queryInterface.bulkDelete('JoinRequests', null, {})
};

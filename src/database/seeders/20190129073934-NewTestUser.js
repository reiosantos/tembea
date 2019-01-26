module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Users', [
    {
      name: 'James Bond',
      slackId: 'JAMESB',
      email: 'james.bond@email.com',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14'
    },
    {
      name: 'David Blake',
      slackId: 'DAVID0001',
      email: 'david.blake@email.com',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14'
    },
    {
      name: 'John Lee',
      slackId: 'JOHN101',
      email: 'john.lee@email.com',
      createdAt: '2019-01-14',
      updatedAt: '2019-01-14'
    },
  ]),
  down: queryInterface => queryInterface.bulkDelete('Users')
};

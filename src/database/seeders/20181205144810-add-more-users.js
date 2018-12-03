module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Users', [
    {
      name: 'Test buddy 1',
      slackId: 'TEST123',
      email: 'test.buddy1@andela.com',
      createdAt: '2018-11-15',
      updatedAt: '2018-11-15'
    },
    {
      name: 'Test buddy 2',
      slackId: 'TEST1234',
      email: 'test.buddy2@andela.com',
      createdAt: '2018-11-15',
      updatedAt: '2018-11-15'
    },
    {
      name: 'Grace',
      slackId: 'UE2C0H807',
      email: 'grace.samuel@andela.com',
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      name: 'James Enejo',
      slackId: 'UE0LRU77T',
      email: 'james.enejo@andela.com',
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    }
  ]),
  down: queryInterface => queryInterface.bulkDelete('Users')
};

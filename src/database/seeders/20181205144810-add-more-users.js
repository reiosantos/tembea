module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Users', [
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
  down: (queryInterface) => queryInterface.bulkDelete('Users')
};

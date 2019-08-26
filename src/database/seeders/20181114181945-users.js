module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Users', [
    {
      name: 'John smith',
      slackId: '345qq',
      email: 'john.smith@gmail.com',
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    },
    {
      name: 'Derrick jones',
      slackId: '345sl',
      email: 'derrick.jones@gmail.com',
      createdAt: '2018-11-14',
      updatedAt: '2018-11-14'
    }
  ]),
  down: (queryInterface) => queryInterface.bulkDelete('Users')
};

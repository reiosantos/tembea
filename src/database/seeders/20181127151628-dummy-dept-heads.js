module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Users', [
    {
      name: 'Abishai Omari',
      slackId: 'UE1FCCKB7',
      email: 'abishai.omari@andela.com',
      createdAt: '2018-11-27',
      updatedAt: '2018-11-27'
    },
    {
      name: 'Leon Kioko',
      slackId: 'UE0M46P3K',
      email: 'leon.kioko@andela.com',
      createdAt: '2018-11-27',
      updatedAt: '2018-11-27'
    },
    {
      name: 'Oluwatominiyin Adebanjo',
      slackId: 'UE144LRAQ',
      email: 'oluwatominiyin.adebanjo@andela.com',
      createdAt: '2018-11-28',
      updatedAt: '2018-11-28'
    },
    {
      name: 'Opeoluwa Iyi-Kuyoro',
      slackId: 'UE1920ZNW',
      email: 'opeoluwa.iyi-kuyoro@andela.com',
      createdAt: '2018-11-29',
      updatedAt: '2018-11-29'
    }
  ]),

  down: queryInterface => queryInterface.bulkDelete('Users')
};

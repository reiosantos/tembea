module.exports = {
  up: queryInterface => queryInterface.bulkInsert('TeamDetails', [{
    teamId: 'TEAMID2',
    botId: 'BOTID2',
    botToken: 'BOTTOKEN2',
    teamName: 'TEAMNAME2',
    teamUrl: 'https://ACME.slack.com',
    webhookConfigUrl: 'https://acme.randomurl.com',
    userId: 'USERID2',
    userToken: 'USERTOKEN2',
    createdAt: '2018-12-11',
    updatedAt: '2018-12-11'
  }], {}),

  down: queryInterface => queryInterface.bulkDelete('TeamDetails', null, {})
};

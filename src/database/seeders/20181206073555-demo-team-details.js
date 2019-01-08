module.exports = {
  up: queryInterface => queryInterface.bulkInsert('TeamDetails', [{
    teamId: 'TEAMID1',
    botId: 'XXXXXX',
    botToken: 'XXXXXXX',
    teamName: 'Team 1',
    teamUrl: 'randomurl',
    webhookConfigUrl: 'randomurl',
    userId: 'XXXXXX',
    userToken: 'XXXXXXX',
    createdAt: '2018-12-06',
    updatedAt: '2018-12-06',
    opsChannelId: 'opsChannel'
  }]),

  down: queryInterface => queryInterface.bulkDelete('TeamDetails')
};

import TeamDetailsService from '../../../../../services/TeamDetailsService';
import SlackHelpers from '..';

describe('SlackHelpers', () => {
  describe('getBotTokenByTeamUrl', () => {
    it('should get botToken', async () => {
      const requestData = { teamUrl: 'adaeze.slackcom' };
      jest.spyOn(TeamDetailsService, 'getTeamDetailsByTeamUrl').mockResolvedValue({
        botToken: 'xoop'
      });
      const slackbotToken = await SlackHelpers.getBotTokenByTeamUrl(requestData.teamUrl);
      expect(slackbotToken).toEqual('xoop');
    });
  });
});

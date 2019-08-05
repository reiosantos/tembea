import TeamDetailsService from '../../../../services/TeamDetailsService';

/**
 * @class
 * @description Holds a collection of slack-related helpers
 */
class SlackHelpers {
  /**
   * @param {string} url - slack teamUrl
   * @returns {Promise<string>} slack bot token
   */
  static async getBotTokenByTeamUrl(url) {
    const { botToken } = await TeamDetailsService.getTeamDetailsByTeamUrl(url);
    return botToken;
  }

  /**
   *
   * @param {string} teamId
   * @returns {string} slack bot token
   */
  static async getBotTokenByTeamId(teamId) {
    const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
    return slackBotOauthToken;
  }

  /**
   *
   * @param {string} teamId
   * @param {string} teamUrl
   * @returns {Promise<string>} slack bot token
   * @description Retrieves a slack bot token based on the teamId or the teamUrl
   */
  static async getSlackBotOAuthToken(teamId, teamUrl) {
    let slackBotOauthToken;
    if (teamId) {
      slackBotOauthToken = await SlackHelpers.getBotTokenByTeamId(teamId);
    } else {
      slackBotOauthToken = await SlackHelpers.getBotTokenByTeamUrl(teamUrl);
    }
    return slackBotOauthToken;
  }
}

export default SlackHelpers;

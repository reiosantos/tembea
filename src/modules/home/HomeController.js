import request from 'request-promise-native';
import url from 'url';
import TeamDetailsService from '../../services/TeamDetailsService';
import bugsnagHelper from '../../helpers/bugsnagHelper';

export const SlackInstallUrl = `https://slack.com/oauth/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=team:read,chat:write:bot,chat:write:user,bot,commands,users.profile:read,users:read.email,users:read,incoming-webhook`;

export default class HomeController {
  static index(req, res) {
    res.render('home/index.html', {
      title: 'Welcome to Tembea',
      message: 'I can help you book trips at Andela.',
      slackButtonHref: '/install'
    });
  }

  static install(req, res) {
    res.redirect(SlackInstallUrl);
  }

  static privacy(req, res) {
    res.render('home/index.html', { });
  }

  static support(req, res) {
    res.render('home/index.html', { });
  }

  static async auth(req, res) {
    if (HomeController.validateAuthRequest(req)) {
      return HomeController.renderErrorPage(res, 'Authentication failed!');
    }
    try {
      const response = await HomeController.sendSlackAuthRequest(req);
      const jsonResponse = JSON.parse(response.body);
      if (jsonResponse.ok) {
        // create and save team credentials
        const teamObject = HomeController.convertJSONResponseToTeamDetailsObj(jsonResponse);
        await TeamDetailsService.saveTeamDetails({ ...teamObject });
        return res.render('home/installed.html');
      }
      HomeController.renderErrorPage(res, 'Tembea could not be installed in your workspace.');
    } catch (error) {
      bugsnagHelper.log(error);
      return HomeController.renderErrorPage(res, error.message);
    }
  }

  static validateAuthRequest(req) {
    return !req.query.code || req.query.error;
  }

  static async sendSlackAuthRequest(req) {
    return request({
      url: 'https://slack.com/api/oauth.access',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      formData: {
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code: req.query.code
      },
      resolveWithFullResponse: true
    });
  }

  static renderErrorPage(res, message) {
    const title = 'Installation failed';
    res.render('home/failed.html', { message, title });
  }

  static convertJSONResponseToTeamDetailsObj(jsonResponse) {
    // get tokens and other data
    const urlObject = url.parse(jsonResponse.incoming_webhook.configuration_url);
    const teamUrl = `https://${urlObject.host}`;
    return {
      botId: jsonResponse.bot.bot_user_id,
      botToken: jsonResponse.bot.bot_access_token,
      teamId: jsonResponse.team_id,
      teamName: jsonResponse.team_name,
      userId: jsonResponse.user_id,
      userToken: jsonResponse.access_token,
      webhookConfigUrl: jsonResponse.incoming_webhook.url,
      opsChannelId: jsonResponse.incoming_webhook.channel_id,
      teamUrl,
    };
  }
}

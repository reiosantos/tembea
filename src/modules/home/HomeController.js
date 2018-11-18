import request from 'request-promise-native';
import url from 'url';
import models from '../../database/models';

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
    res.render('/home/index.html', { });
  }

  static support(req, res) {
    res.render('/home/index.html', { });
  }

  static async auth(req, res) {
    if (!req.query.code || req.query.error) {
      return res.render('/home/failed.html', {
        title: 'Installation failed',
        message: 'Authentication failed!'
      });
    }
    try {
      const response = await request({
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
      const jsonResponse = JSON.parse(response.body);
      if (jsonResponse.ok) {
        // get tokens and other data
        const botId = jsonResponse.bot.bot_user_id;
        const botToken = jsonResponse.bot.bot_access_token;
        const teamId = jsonResponse.team_id;
        const teamName = jsonResponse.team_name;
        const userId = jsonResponse.user_id;
        const userToken = jsonResponse.access_token;
        const webhookConfigUrl = jsonResponse.incoming_webhook.configuration_url;
        const urlObject = url.parse(webhookConfigUrl);
        // create and save team credentials
        await models.TeamDetails.upsert({
          botId,
          botToken,
          teamId,
          teamName,
          teamUrl: `https://${urlObject.host}`,
          webhookConfigUrl,
          userId,
          userToken
        });
        return res.render('home/installed.html');
      }
      throw new Error('Tembea could not be installed in your workspace.');
    } catch (error) {
      return res.render('/home/failed.html', { message: error.message });
    }
  }
}

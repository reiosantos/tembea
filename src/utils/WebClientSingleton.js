import { WebClient } from '@slack/client';

class WebClientSingleton {
  static getWebClient(teamBotOauthToken) {
    return new WebClient(teamBotOauthToken);
  }
}

export default WebClientSingleton;

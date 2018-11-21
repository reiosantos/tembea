import { WebClient } from '@slack/client';

class SlackIntegrations {
  static web(oauthToken) {
    return new WebClient(oauthToken);
  }
}

export default SlackIntegrations;

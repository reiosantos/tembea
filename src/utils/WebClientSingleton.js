import { WebClient } from '@slack/client';

class WebClientSingleton {
  constructor() {
    if (WebClientSingleton.exists) {
      return WebClientSingleton.instance;
    }
    this.web = new WebClient(process.env.BOT_TOKEN);
    WebClientSingleton.instance = this;
    WebClientSingleton.exists = true;
  }

  getWebClient() {
    return this.web;
  }
}

export default WebClientSingleton;

class WebClientSingleton {
  constructor() {
    if (WebClientSingleton.exists) {
      return WebClientSingleton.instance;
    }
    this.web = {
      im: { open: () => ({ channel: { id: 'just a dummy id' } }) },
      dialog: { open: () => ({ data: 'just to know i worked' }) },
      chat: {
        postMessage: () => ({ data: 'successfully opened chat' }),
        update: () => ({})
      },
      users: {
        info: () => ({
          user: {
            tz_offset: 3600
          }
        })
      }
    };
    WebClientSingleton.instance = this;
    WebClientSingleton.exists = true;
  }

  getWebClient() {
    return this.web;
  }
}

export default WebClientSingleton;

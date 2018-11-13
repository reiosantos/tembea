class WebClientSingleton {
  constructor() {
    if (WebClientSingleton.exists) {
      return WebClientSingleton.instance;
    }
    this.web = {
      dialog: {
        open: () => ({ data: 'just to know i worked' })
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

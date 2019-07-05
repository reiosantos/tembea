import WebClientSingleton from '../WebClientSingleton';

describe('The WebClientSingleton Test', () => {
  it('should return the created webclient', () => {
    const web = WebClientSingleton.getWebClient('hello');
    expect(web.constructor.name).toEqual('WebClient');
  });
});

import WebClientSingleton from '../WebClientSingleton';

describe('The WebClientSingleton Test', () => {
  it('should return the created webclient', () => {
    const web1 = new WebClientSingleton();
    const web2 = new WebClientSingleton();

    expect(web2.web).toEqual(web1.getWebClient());
  });
});

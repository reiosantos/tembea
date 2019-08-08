import appEvents from '../app-event.service';

describe('AppEvents Service', () => {
  it('should broadcast observable', () => {
    jest.spyOn(appEvents.subject, 'pipe');
    jest.spyOn(appEvents.subject, 'subscribe').mockImplementation(() => {});
    appEvents.subscribe('ROUTE_EVENT', { data: '1', slackBotOauthToken: 'xoop-sdasdw' });
    expect(appEvents.subject.pipe).toHaveBeenCalled();
    expect(appEvents.subject.subscribe).toHaveBeenCalled();
  });

  it('should subscribe to observable', async () => {
    jest.spyOn(appEvents.subject, 'next');
    appEvents.broadcast(
      { name: 'ROUTE_EVENT', data: { routeId: '1', slackBotOauthToken: 'xoop-sdasdw' } }
    );
    expect(appEvents.subject.next).toHaveBeenCalled();
  });
});

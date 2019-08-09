import appEvents from '../app-event.service';

describe('AppEvents Service', () => {
  it('should broadcast observable', (done) => {
    const testPayload = { name: 'TEST_EVENT', data: 'test' };
    const testHandler = jest.fn();

    appEvents.subscribe(testPayload.name, testHandler);
    appEvents.broadcast(testPayload);

    setTimeout(() => {
      expect(testHandler).toHaveBeenCalledWith('test');
      done();
    }, 2000);
  });
});

import appEvents from '../app-event.service';

describe('AppEvents Service', () => {
  it('should broadcast observable', async (done) => {
    const testPayload = { name: 'TEST_EVENT', data: 'test' };
    const testHandler = jest.fn();

    appEvents.subscribe(testPayload.name, testHandler);
    appEvents.broadcast(testPayload);

    await new Promise((resolve) => setTimeout(() => {
      resolve();
    }, 2000));
    expect(testHandler).toHaveBeenCalledWith('test');
    done();
  });
});

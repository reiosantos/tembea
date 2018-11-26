import DialogPrompts from '../DialogPrompts';

jest.mock('@slack/client', () => ({
  WebClient: jest.fn(() => ({
    dialog: {
      open: jest.fn(() => Promise.resolve({
        status: true
      }))
    }
  }))
}));

describe('Dialog prompts test', () => {
  it('should test sendTripDetailsForm function when forSelf is false', (done) => {
    const payload = jest.fn(() => 'payload');
    const result = DialogPrompts.sendTripDetailsForm(payload, 'false');

    expect(result).toBe(undefined);
    done();
  });

  it('should test sendTripDetailsForm function when forSelf is true', (done) => {
    const payload = jest.fn(() => ({ trigger_id: 'trigger' }));
    const result = DialogPrompts.sendTripDetailsForm(payload, 'true');

    expect(result).toBe(undefined);
    done();
  });

  it('should test sendRescheduleTripForm function', (done) => {
    const payload = jest.fn(() => ({ callback_id: 'calling' }));
    const result = DialogPrompts.sendRescheduleTripForm(payload, 'call', 'state', 'dialog');

    expect(result).toBe(undefined);
    done();
  });

  it('should say chill', (done) => {
    const result = 'chill';
    expect(result).toBe('chill');
    done();
  });
});

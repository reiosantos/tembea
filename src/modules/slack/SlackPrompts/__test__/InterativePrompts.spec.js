import InteractivePrompts from '../InteractivePrompts';

describe('Interactive Prompts test', () => {

  it('should sendBookNewTrip Response', (done) => {
    const respond = jest.fn(() => 'respond');
    const payload = jest.fn(() => 'respond');
    const result = InteractivePrompts.sendBookNewTripResponse(payload, respond);
    expect(result).toBe(undefined);
    expect(respond).toHaveBeenCalled();
    done();
  });

  it('should create view open trips response', (done) => {
    const respond = jest.fn(() => 'respond');
    const payload = { user: { id: 1 }, submission: { rider: 1 } };
    const result = InteractivePrompts.sendCompletionResponse(payload, respond, 1);
    expect(result).toBe(undefined);
    expect(respond).toHaveBeenCalled();
    done();
  });
});

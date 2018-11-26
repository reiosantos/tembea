import navButtons from '../index';

describe('Navigation Buttons', () => {
  it('should return an object', () => {
    const attachment = navButtons('step_back', 'some_callbackId');
    expect(attachment.actions.length).toEqual(2);
  });
});

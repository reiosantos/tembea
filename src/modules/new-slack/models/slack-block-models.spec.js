import {
  ensureSlackText, SlackText, BlockMessage
} from './slack-block-models';


describe('ensureSlackText', () => {
  it('should return slack text when given a string', () => {
    const text = ensureSlackText('Kigali');
    expect(text).toEqual({ type: 'plain_text', text: 'Kigali' });
  });

  it('should return slack text as it was passed in', () => {
    const text = ensureSlackText(new SlackText('hello'));
    expect(text).toEqual(new SlackText('hello'));
  });
});

describe('BlockMessage', () => {
  it('should add channel to the block message', () => {
    const message = new BlockMessage([], 'operations');
    expect(message.channel).toBeDefined();
    expect(message.channel).toEqual('operations');
  });
});

describe('SlackText', () => {
  it('should return a slack text that accepts emojis', () => {
    const text = new SlackText('Hello', '', true);
    expect(text.emoji).toBeTruthy();
  });
});

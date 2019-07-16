import {
  Block, ensureSlackText, SlackText, BlockMessage
} from './slack-block-models';
import userTripBlocks from '../trips/user/blocks';

describe('slack-block-models', () => {
  describe('Block', () => {
    const block = new Block();

    it('updateBlockId: should return a block with updated blockId', () => {
      block.updateBlockId(userTripBlocks.navBlock);
      expect(block.block_id).toEqual(userTripBlocks.navBlock);
    });

    it('addElements: should add more elements', () => {
      block.elements = [1, 2];
      block.addElements([3]);
      expect(block.elements).toEqual([1, 2, [3]]);
    });

    it('addAccessory: should add accessory to a block', () => {
      block.addAccessory('accessory');
      expect(block.accessory).toEqual('accessory');
    });

    it('addFields: should add fields', () => {
      block.fields = [1, 2];
      block.addFields([3]);
      expect(block.fields).toEqual([1, 2, [3]]);
    });
  });

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
});

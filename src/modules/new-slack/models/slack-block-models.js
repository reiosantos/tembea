// constants
export const BlockTypes = Object.freeze({
  section: 'section',
  divider: 'divider',
  actions: 'actions',
  image: 'image'
});

export const TextTypes = Object.freeze({
  plain: 'plain_text',
  markdown: 'mrkdwn'
});

export class BlockMessage {
  constructor(blocks, channel) {
    this.blocks = blocks;
    if (channel) {
      this.channel = channel;
    }
  }
}

export class SlackText {
  constructor(text, type = TextTypes.plain, emoji = false) {
    this.type = type;
    this.text = text;
    if (emoji) this.emoji = emoji;
  }
}

export const ensureSlackText = text => (typeof text === 'string'
  ? new SlackText(text) : text);

// block and children
export class Block {
  constructor(type = BlockTypes.section, blockId = '') {
    this.type = type;
    if (blockId) {
      this.block_id = blockId;
    }
  }

  addText(text) {
    this.text = ensureSlackText(text);
    return this;
  }
}

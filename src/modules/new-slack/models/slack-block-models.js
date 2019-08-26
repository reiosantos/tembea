import { SlackActionButtonStyles } from '../../slack/SlackModels/SlackMessageModels';

// constants
export const BlockTypes = Object.freeze({
  section: 'section',
  divider: 'divider',
  actions: 'actions',
  image: 'image'
});

export const ElementTypes = Object.freeze({
  button: 'button',
  channelSelect: 'channels_select',
  userSelect: 'users_select',
  staticSelect: 'static_select'
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

export const ensureSlackText = (text) => (typeof text === 'string'
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

  updateBlockId(blockId) {
    this.block_id = blockId;
    return this;
  }

  addElements(elements) {
    if (this.elements && this.elements.length > 0) {
      this.elements.push([...elements]);
      return this;
    }
    this.elements = [...elements];
    return this;
  }

  addAccessory(accessory) {
    this.accessory = accessory;
    return this;
  }

  addFields(fields) {
    if (this.fields && this.fields.length > 0) {
      this.fields.push([...fields]);
      return this;
    }

    this.fields = [...fields];
    return this;
  }
}

export class ImageBlock {
  constructor(title, imageUrl, altText) {
    this.type = BlockTypes.image;
    this.title = ensureSlackText(title);
    this.image_url = imageUrl;
    this.alt_text = altText;
  }
}

export class Element {
  constructor(type) {
    this.type = type;
  }
}

export class ButtonElement extends Element {
  constructor(text, value, actionId, style, confirm) {
    super(ElementTypes.button);
    this.text = text;
    this.value = value;
    this.action_id = actionId;
    this.style = style;
    this.confirm = confirm;
  }
}

/**
 *
 */
export class CancelButtonElement extends ButtonElement {
  constructor(text, value, actionId, options) {
    const confirm = {
      title: {
        type: 'plain_text',
        text: options.title
      },
      text: {
        type: 'mrkdwn',
        text: options.description
      },
      confirm: {
        type: 'plain_text',
        text: options.confirmText,
      },
      deny: {
        type: 'plain_text',
        text: options.denyText
      }
    };
    super(new SlackText(text), value, actionId, SlackActionButtonStyles.danger, confirm);
  }
}

export class SelectElement extends Element {
  constructor(type, placeholder, actionId) {
    super(type);
    this.action_id = actionId;
    this.placeholder = ensureSlackText(placeholder);
  }

  addOptions(options) {
    this.options = options;
    return this;
  }
}

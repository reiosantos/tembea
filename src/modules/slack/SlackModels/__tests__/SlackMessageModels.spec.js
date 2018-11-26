import {
  SlackSelectActionWithSlackContent,
  SlackSelectAction,
  SlackCancelButtonAction,
  SlackButtonAction,
  SlackAction,
  SlackAttachmentField,
  SlackAttachment,
  SlackInteractiveMessage
} from '../SlackMessageModels';

describe('Slack Message models test', () => {
  it('should create SlackInteractiveMessage object', () => {
    const result = new SlackInteractiveMessage('text', 'attached', 'channel');

    expect(result).toHaveProperty('text', 'text');
    expect(result).toHaveProperty('attachments', 'attached');
    expect(result).toHaveProperty('channel', 'channel');
  });

  it('should create SlackAttachment object', () => {
    const result = new SlackAttachment('title', 'text', 'author', 'icon', 'img', 'type', 'color');
    result.addOptionalProps('callback');
    result.addFieldsOrActions('fields', [{}]);

    expect(result).toHaveProperty('title', 'title');
    expect(result).toHaveProperty('text', 'text');
    expect(result).toHaveProperty('author_name', 'author');
    expect(result).toHaveProperty('author_icon', 'icon');
    expect(result).toHaveProperty('image_url', 'img');
    expect(result).toHaveProperty('fallback', 'fallback');
    expect(result).toHaveProperty('callback_id', 'callback');
    expect(result).toHaveProperty('fields', [{}]);
  });

  it('should create SlackAttachmentField object', () => {
    const result = new SlackAttachmentField('AttachmentTitle', 'AttachValue', 'short');

    expect(result).toHaveProperty('title', 'AttachmentTitle');
    expect(result).toHaveProperty('value', 'AttachValue');
    expect(result).toHaveProperty('short', 'short');
  });

  it('should create SlackAction object', () => {
    const result = new SlackAction('ActionName', 'ActionText', 'ActionType');

    expect(result).toHaveProperty('name', 'ActionName');
    expect(result).toHaveProperty('text', 'ActionText');
    expect(result).toHaveProperty('type', 'ActionType');
  });

  it('should create SlackButtonAction object', () => {
    const result = new SlackButtonAction('buttonName', 'buttonText', 'buttonValue');

    expect(result).toHaveProperty('name', 'buttonName');
    expect(result).toHaveProperty('text', 'buttonText');
    expect(result).toHaveProperty('value', 'buttonValue');
  });

  it('should create SlackCancelButtonAction object', () => {
    const result = new SlackCancelButtonAction();

    expect(result).toHaveProperty('name', 'cancel');
    expect(result).toHaveProperty('text', 'Cancel');
    expect(result).toHaveProperty('value', 'cancel');
    expect(result).toHaveProperty('confirm');
  });

  it('should create SlackSelectAction object', () => {
    const result = new SlackSelectAction('selectSlack', 'selectSlackText');

    expect(result).toHaveProperty('name', 'selectSlack');
    expect(result).toHaveProperty('text', 'selectSlackText');
  });

  it('should create SlackSelectActionWithSlackContent object', () => {
    const result = new SlackSelectActionWithSlackContent('slack', 'slackText');

    expect(result).toHaveProperty('name', 'slack');
    expect(result).toHaveProperty('text', 'slackText');
  });
});

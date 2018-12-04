export const SlackResponseType = Object.freeze({
  ephemeral: 'ephemeral',
  inChannel: 'in_channel'
});

export const SlackActionTypes = Object.freeze({
  text: 'text',
  textarea: 'textarea',
  button: 'button',
  select: 'select'
});

export const SlackActionButtonStyles = Object.freeze({
  primary: 'primary',
  danger: 'danger'
});

export const SlackKnownDataSources = Object.freeze({
  users: 'users',
  channels: 'channels',
  external: 'external'
});

export class SlackInteractiveMessage {
  constructor(text, attachments, channelId, user, asUser = false) {
    this.text = text;
    this.channel = channelId;
    this.user = user;
    this.as_user = asUser;
    this.attachments = attachments;
    this.response_type = SlackResponseType.ephemeral;
  }
}

export class SlackAttachment {
  constructor(title, text, authorName, authorIcon, imageUrl, attachmentType, color) {
    this.title = title;
    this.text = text;
    this.color = color;
    this.attachment_type = attachmentType;
    this.author_name = authorName;
    this.author_icon = authorIcon;
    this.image_url = imageUrl;
    this.fields = [];
    this.actions = [];
    this.mrkdwn_in = [];
  }

  /**
   * @param  {string} type The type you wish to add 'field' or 'actions'
   * @param  {array} valuesArray The array of fields or actions
   */
  addFieldsOrActions(type, valuesArray) {
    if (Array.isArray(valuesArray)) {
      this[type].push(...valuesArray);
    }
  }

  addOptionalProps(callbackId,
    fallback = 'fallback',
    color = '#3AAF85',
    attachmentType = 'default') {
    if (callbackId) this.callback_id = callbackId;
    if (fallback) this.fallback = fallback;
    if (color) this.color = color;
    if (attachmentType) this.attachment_type = attachmentType;
  }

  /**
   * @param  {array} valuesArray The array of attachment parameters using markdown
   */
  addMarkdownIn(valuesArray) {
    if (Array.isArray(valuesArray)) {
      this.mrkdwn_in.push(...valuesArray);
    }
  }
}

export class SlackAttachmentField {
  constructor(title, value, short) {
    this.title = title;
    this.value = value;
    this.short = short;
  }
}

export class SlackAction {
  constructor(name, text, type) {
    this.name = name;
    this.text = text;
    this.type = type;
  }
}

export class SlackButtonAction extends SlackAction {
  constructor(
    name, text, value, style = SlackActionButtonStyles.primary
  ) {
    super(
      name, text, SlackActionTypes.button
    );
    this.style = style;
    this.value = value;
  }
}

export class SlackCancelButtonAction extends SlackButtonAction {
  constructor(text = 'Cancel',
    value = 'cancel',
    cancellationText = 'Do you really want to cancel?',
    name = 'cancel') {
    super(name, text, value, SlackActionButtonStyles.danger);
    {
      const confirmDialogue = {
        title: 'Are you sure?',
        text: cancellationText,
        ok_text: 'Yes',
        dismiss_text: 'No'
      };
      this.confirm = confirmDialogue;
    }
  }
}

export class SlackSelectAction extends SlackAction {
  constructor(name, text, options = []) {
    super(name, text, SlackActionTypes.select, options);
    this.options = options;
  }
}

export class SlackSelectActionWithSlackContent extends SlackAction {
  constructor(name, text, dataSource = SlackKnownDataSources.users) {
    super(name, text, SlackActionTypes.select);
    this.data_source = dataSource;
  }
}

export class SlackButtonsAttachmentFromAList {
  static createButtons(list) {
    const createdButtons = list.map(department => new SlackButtonAction(
      department.label.toLocaleLowerCase().replace(' ', '_'),
      department.label,
      department.value,
      '#FFCCAA'
    ));
    return createdButtons;
  }

  static createAttachments(list, callbackId) {
    const attachments = [];

    const buttons = this.createButtons(list);

    while (buttons.length > 0) {
      const fiveButtons = buttons.splice(0, 5);
      const slackAttachment = new SlackAttachment();

      slackAttachment.addFieldsOrActions('actions', fiveButtons);
      slackAttachment.addOptionalProps(callbackId);
      attachments.push(slackAttachment);
    }
    return attachments;
  }
}

export const SlackDelayedSuccessResponse = new SlackInteractiveMessage(
  'Thank you. Your request is processing'
);

export const SlackFailureResponse = new SlackInteractiveMessage(
  'Sorry, something went wrong. Please try again'
);

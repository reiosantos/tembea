import {
  SlackAttachment, SlackButtonAction, SlackCancelButtonAction
} from '../../../modules/slack/SlackModels/SlackMessageModels';

export default (callbackId, value, optionsButton = null) => {
  const navAttachment = new SlackAttachment();
  const buttons = [new SlackButtonAction('back', '< Back', value, '#FFCCAA')];
  if (optionsButton) buttons.push(optionsButton);
  buttons.push(new SlackCancelButtonAction());
  navAttachment.addFieldsOrActions('actions', buttons);
  navAttachment.addOptionalProps(callbackId, undefined, '#4285f4');

  return navAttachment;
};

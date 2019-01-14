import {
  SlackAttachment, SlackButtonAction, SlackCancelButtonAction
} from '../../../modules/slack/SlackModels/SlackMessageModels';

export default (callbackId, value) => {
  const navAttachment = new SlackAttachment();
  navAttachment.addFieldsOrActions('actions', [
    new SlackButtonAction('back', '< Back', value, '#FFCCAA'),
    new SlackCancelButtonAction()
  ]);
  navAttachment.addOptionalProps(callbackId, undefined, '#4285f4');

  return navAttachment;
};

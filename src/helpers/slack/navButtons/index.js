import {
  SlackAttachment, SlackButtonAction, SlackCancelButtonAction
} from '../../../modules/slack/SlackModels/SlackMessageModels';

export default (value, callbackId) => {
  const navAttachment = new SlackAttachment();
  navAttachment.addFieldsOrActions('actions', [
    new SlackButtonAction('back', '< Back', value, '#FFCCAA'),
    new SlackCancelButtonAction()
  ]);

  navAttachment.addOptionalProps(callbackId, 'fallback', '#FFCCAA', 'default');

  return navAttachment;
};

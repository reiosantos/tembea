import {
  SlackAttachment, SlackButtonAction
} from '../../../modules/slack/SlackModels/SlackMessageModels';

export default (callbackId, value) => {
  const searchAttachment = new SlackAttachment();
  searchAttachment.addFieldsOrActions('actions', [
    new SlackButtonAction('search', 'Search', value, '#FFCCAA'),
  ]);
  searchAttachment.addOptionalProps(callbackId, undefined, '#4285f4');

  return searchAttachment;
};

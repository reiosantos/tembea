import {
  SlackAttachment,
  SlackAttachmentField, SlackInteractiveMessage
} from '../../../modules/slack/SlackModels/SlackMessageModels';
import Utils from '../../utils';

const getTitle = (data, channel) => {
  let response = data.riderName ? `You requested this ride for ${data.riderName}` : null;

  if (data.riderId === channel) {
    response = `${data.requesterName} has made this request for you`;
  }
  return response;
};

export const userResponse = (user, data, channel) => {
  const {
    department, pickup, destination, requestDate, departureDate
  } = data;

  const titleAttachment = new SlackAttachment(
    `From ${department} department`, null, null, null, null, 'default', '#4aa149'
  );
  const detailedAttachment = new SlackAttachment(
    getTitle(data, channel.id), null, null, null, null, 'default', '#29b016'
  );

  const fields = [
    new SlackAttachmentField('Pickup', pickup, true),
    new SlackAttachmentField('Destination', destination, true),
    new SlackAttachmentField('Request Date', Utils.formatDate(requestDate), true),
    new SlackAttachmentField('Departure Date', Utils.formatDate(departureDate), true)
  ];
  detailedAttachment.addFields(fields);

  const attachments = [titleAttachment, detailedAttachment];

  return new SlackInteractiveMessage(
    'We have received your request. We shall be responding to it shortly.', attachments, channel.id
  );
};

export const opsResponse = (channelId, tripFormat, data, color) => {
  const {
    pickup, destination, departureDate, riderName, requesterName, requestStatus
  } = data;

  const title = riderName
    ? `${requesterName} has requested this ride for ${riderName}`
    : `${requesterName} has requested for this ride.`;

  const detailedAttachment = new SlackAttachment(
    title, tripFormat, null, null, null, 'default', color
  );
  const fields = [
    new SlackAttachmentField('Pickup Location', pickup, true),
    new SlackAttachmentField('Destination', destination, true),
    new SlackAttachmentField('Departure', Utils.formatDate(departureDate), true),
    new SlackAttachmentField('Status', requestStatus, true)
  ];
  detailedAttachment.addFields(fields);

  return new SlackInteractiveMessage(
    '*Tembea* :oncoming_automobile:', [detailedAttachment], channelId
  );
};

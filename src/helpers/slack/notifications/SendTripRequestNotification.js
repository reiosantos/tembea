import { WebClient } from '@slack/client';
import Utils from '../../utils/index';
import { opsResponse, userResponse } from './responseObjects';

const token = process.env.SLACK_OAUTH_TOKEN;
const channelId = process.env.OPERATIONS_DEPT_SLACK_CHANNEL_ID;

const web = new WebClient(token);

const generateResponse = (tripId, data) => {
  const { department, requestDate, requestStatus } = data;
  const textArray = ['*Department:*', department, Utils.formatDate(requestDate)];

  const tripFormat = textArray.join(', ');
  const color = requestStatus && requestStatus
    .toLowerCase().startsWith('c') ? '#EB3432' : '#29b016';

  return opsResponse(tripId, channelId, tripFormat, data, color);
};

const sendTripRequestNotification = async (tripId, user, channel, data = {
  riderId: null,
  riderName: null,
  requesterName: null,
  department: null,
  destination: null,
  pickup: null,
  departureDate: null,
  requestDate: new Date(),
  requestStatus: null
}) => {
  const responseData = { ...data };
  web.chat.postMessage(generateResponse(tripId, responseData))
    .then(messageResponse => ({ message: messageResponse }));
};

export default sendTripRequestNotification;

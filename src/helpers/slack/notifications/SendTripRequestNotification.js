import { WebClient } from '@slack/client';
import Utils from '../../utils/index';
import { opsResponse, userResponse } from './responseObjects';

const token = process.env.SLACK_OAUTH_TOKEN;
const channelId = process.env.OPERATIONS_DEPT_SLACK_CHANNEL_ID;

const web = new WebClient(token);

const generateResponse = (data) => {
  const { department, requestDate, requestStatus } = data;
  const textArray = ['*Department:*', department, Utils.formatDate(requestDate)];

  const tripFormat = textArray.join(', ');
  const color = requestStatus && requestStatus
    .toLowerCase().startsWith('c') ? '#EB3432' : '#29b016';

  return opsResponse(channelId, tripFormat, data, color);
};

const sendTripRequestNotification = async (user, channel, data = {
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
  let responseData = { ...data };

  if (data.riderId) {
    await web.users.profile.get({ user: data.riderId }).then((response) => {
      const { real_name: riderName = null } = response.profile;
      responseData = { ...responseData, riderName };
    });

    web.chat.postMessage(userResponse(user, responseData, { id: data.riderId })).then();
  }

  web.chat.postMessage(userResponse(user, responseData, channel))
    .then(() => web.chat.postMessage(generateResponse(responseData))
      .then(messageResponse => ({ message: messageResponse })));
};

export default sendTripRequestNotification;

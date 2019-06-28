const providersPayload = {
  actions: [{ name: 'action', value: '1' }],
  channel: { id: 1 },
  team: { id: 'TEAMID1' },
  original_message: { ts: 'timestamp' },
  user: { id: '4' },
  submission: {
    cab: '4,toyota,LND 419 CN',
    driver: '1,James Savali,708989098,254234',
    routeName: 'thika',
    takeOffTime: '01:30'
  },
  callback_id: 'confirm_providers_approval',
};

let timeStamp;
let channelId;
const state = JSON.stringify({
  timeStamp,
  channelId,
  tripId: 'accept_request_3_{"routeName":"sdf","takeOffTime":"01:30","Provider":"1,Uber Kenya,15"}'
});

const reassignDriverPayload = {
  type: 'interactive_message',
  actions: [{ name: '1015', type: 'select', selected_options: [{ value: '5' }] }],
  callback_id: 'reassign_driver',
  team: { id: 'TJPMCN24X', domain: 'adaezeodurukwe' },
  channel: { id: 'DJAE0K02X', name: 'directmessage' },
  user: { id: 'UJPMCN431', name: 'adaeze.eze-odurukwe' },
  action_ts: '1561988650.332800',
  message_ts: '1561743678.001100',
  attachment_id: '1',
  token: 'QahKErmd4xRQnfAcKDYscSwJ',
  is_app_unfurl: false,
  original_message: {
    type: 'message',
    subtype: 'bot_message',
    text: '*James Savali* has been deleted by Andela Operations team.',
    ts: '1561743678.001100',
    username: 'AddieBot',
    bot_id: 'BJFH3PUNM',
  }
};

const route = {
  id: 1007,
  inUse: 4,
  takeOff: '03:00',
  batch: 'A',
  capacity: 4,
  status: 'Active',
  comments: 'Voluptatem blanditiis aliquam blanditiis ipsa impedit.',
  routeId: 1001,
  cabId: 1,
  driverId: '5',
  route: { name: 'prank' },
  riders: [[{
    name: 'Adaeze',
    slackId: 'xyxxx',
    routeBatch: 1008
  }]],
};

const user = {
  name: 'Adaeze',
  slackId: 'xyxxx',
  routeBatch: 1008
};

const driver = {
  id: 1,
  providerId: 1,
  driverName: 'ada',
  driverPhoneNo: '09090009099',
};

export {
  providersPayload,
  route,
  state,
  reassignDriverPayload,
  driver,
  user
};

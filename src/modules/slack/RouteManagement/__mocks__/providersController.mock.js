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

const reassignCabPayload = {
  type: 'interactive_message',
  actions:
   [{ name: '1005', type: 'select', selected_options: [{ value: '1' }] }],
  callback_id: 'cab_reassign',
  team: { id: 'TE2K8PGF8', domain: 'andela-tembea' },
  channel: { id: 'DJHPQ75RP', name: 'directmessage' },
  user: { id: 'UJMKKFC5N', name: 'segun.oluwadare' },
  action_ts: '1562073571.892214',
  message_ts: '1562073459.000100',
  attachment_id: '1',
  token: '3YJkyjPNvGpwB7Jo2v3alB9e',
  is_app_unfurl: false,
  original_message:
   {
     type: 'message',
     subtype: 'bot_message',
     text:
      'Hi *Uber Kenya*, a vehicle of model *subaru* and a Registration Number: *SMI 319 JK* has been deleted by Andela Operations team.*',
     ts: '1562073459.000100',
     username: 'Tembea App',
     bot_id: 'BJQ1S9EP8',
   }
};

const route = {
  id: 1018,
  inUse: 2,
  takeOff: '03:00',
  batch: 'D',
  capacity: 6,
  status: 'Active',
  comments: 'Sunt deserunt consequatur.',
  routeId: 1003,
  cabId: 17,
  driverId: 3,
  riders: [{
    name: 'Segun',
    slackId: 'xyxxx',
    routeBatchId: 1018
  }],
  route: {
    name: 'Segun',
    destination: { address: 'old school road' }
  }
};

const user = {
  id: 15,
  name: 'Segun Oluwadare',
  slackId: 'UJMKKFC5N',
  phoneNo: null,
  email: 'segun.oluwadare@andela.com',
  defaultDestinationId: null,
  routeBatchId: 1022,
};

const driver = {
  id: 1,
  providerId: 1,
  driverName: 'ada',
  driverPhoneNo: '09090009099',
};

const cab = {
  id: 17,
  regNumber: 'SMR 313 JK',
  capacity: '4',
  model: 'Mitsubishi Mirage',
  providerId: 1,
};

export const routeData = {
  id: 1,
  batchUseDate: '2018-05-03',
  cabDetails: cab,
  riders: [user],
  driver,
  route: {
    routeId: 1001,
    name: 'Hoeger Pine',
    destination: {
      locationId: 1002,
      address: '629 O\'Connell Flats'
    }
  }
};

const SlackAttachment = {
  title: 'Route Creation Complete',
  text: undefined,
  color: '#3AAF85',
  attachment_type: 'default',
  author_name: undefined,
  author_icon: undefined,
  image_url: undefined,
  fields: [
    {
      title: '*_`Route Information`_*',
      value: null,
      short: false
    },
    {
      title: 'Route Name',
      value: 'Hoeger Pine',
      short: true
    },
  ],
  actions: [],
  mrkdwn_in: [],
  callback_id: 'assignment_notification',
  fallback: 'fallback',
  buttonValue: 'defaultButton'
};

const completeOpsAssignCabPayload = {
  state,
  ...providersPayload,
  submission: {
    driver: 1,
    cab: 1,
    confirmationComment: 'comment',
  },
  origin: { address: 'pickup' },
  destination: { address: 'destination' },
  rider: { name: 'passenger', phoneNo: 'phone' },
};

export {
  providersPayload,
  state,
  reassignCabPayload,
  reassignDriverPayload,
  route,
  cab,
  user,
  driver,
  SlackAttachment,
  completeOpsAssignCabPayload
};

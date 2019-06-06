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

export { providersPayload, state };

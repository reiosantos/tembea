import SlackNotifications from '../index';

jest.mock('@slack/client', () => ({
  WebClient: jest.fn(() => ({
    chat: { postMessage: jest.fn(() => Promise.resolve(() => {})) },
    users: {
      profile: {
        get: jest.fn(() => Promise.resolve({
          profile: { real_name: 'someName' }
        }))
      }
    }
  })),
}));

describe('slack integration tests', () => {
  const response = jest.fn;

  const payload = {
    type: 'dialog_submission',
    token: 'someToken',
    action_ts: '1542714350.866050',
    team: { id: 'someTeamID', domain: 'andela-tembea' },
    user: { id: 'someUserID', name: 'ronald.sekitto' },
    channel: { id: 'someChannelID', name: 'directmessage' },
    submission:
      {
        rider: 'someRiderID',
        department: 'Technology',
        pickup: 'kasubi',
        destination: 'nansana',
        date_time: '12/12/2018 12:12'
      },
    callback_id: 'schedule_trip_form',
    response_url: 'https://hooks.slack.com/app/response_url',
    state: ''
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('respond with undefined after successful notification for someone', async (done) => {
    expect(SlackNotifications.notifyNewTripRequests(payload, response)).toBeInstanceOf(Object);
    done();
  });

  it('respond with undefined after successful notification for a request for self',

    async (done) => {
      expect(SlackNotifications.notifyNewTripRequests({
        ...payload,
        channel: { id: 'someName' },
        submission: {}
      }, response))
        .toBeInstanceOf(Object);

      done();
    });
});

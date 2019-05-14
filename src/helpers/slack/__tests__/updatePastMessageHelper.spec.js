import request from 'request-promise-native';
import UpdateSlackMessageHelper from '../updatePastMessageHelper';


describe('UpdateSlackMessageHelper', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  it('should should send a request and update a Slack message', async () => {
    const payload = { state: { response_url: 'https://webhook.com/slack/' } };
    payload.state = JSON.stringify(payload.state);

    const data = { text: 'Noted' };

    const options = {
      url: 'https://webhook.com/slack/',
      method: 'POST',
      json: true,
      body: data,
      headers: { 'content-type': 'application/json', }
    };

    request.post = jest.fn().mockResolvedValue({ ok: true });
    await UpdateSlackMessageHelper.updateMessage(payload.state, data);
    expect(request).toBeCalledWith(options);
  });
});

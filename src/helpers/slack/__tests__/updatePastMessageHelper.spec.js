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

  it('should send request to delete slack messages using the response_url', async () => {
    const responseUrl = 'https://webhook.com/slack/';
    const options = {
      url: responseUrl,
      method: 'DELETE',
      resolveWithFullResponse: true
    };
    request.delete = jest.fn().mockResolvedValue({ ok: true });
    await UpdateSlackMessageHelper.deleteMessage(responseUrl);
    expect(request).toBeCalledWith(options);
  });
});

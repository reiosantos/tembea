import request from 'request-promise-native';
import UpdateSlackMessageHelper from '../updatePastMessageHelper';

jest.mock('request');

describe('UpdateSlackMessageHelper', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  it('should should send a request and update a Slack message', async () => {
    const testUrl = 'http://tembea-staging.andela.com/api/v1/slack/command';
    const payload = { state: JSON.stringify({ response_url: testUrl }) };
    const data = { text: 'Noted' };

    const options = {
      url: testUrl,
      method: 'POST',
      json: true,
      body: data,
      headers: { 'content-type': 'application/json', }
    };

    await UpdateSlackMessageHelper.updateMessage(payload.state, data);
    expect(request).toHaveBeenCalledWith(options);
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

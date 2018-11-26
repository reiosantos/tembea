import { WebClient } from '@slack/client';
import slackIntegrations from '../slackIntegrations';

jest.mock('@slack/client');
const mock = WebClient;
mock.mockImplementation(value => value);
mock();

describe('test slack integration helper', () => {
  it('should return a new webClient', () => {
    const result = slackIntegrations.web('token');

    expect(typeof (result)).toBe('object');
    expect(mock).toBeCalledWith('token');
  });
});

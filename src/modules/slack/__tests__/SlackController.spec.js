import request from 'supertest';
import app from '../../../app';
import SlackControllerMock from '../__mocks__/SlackControllerMock';

jest.mock('@slack/client', () => ({
  WebClient: jest.fn(() => ({
    chat: { postMessage: jest.fn(() => Promise.resolve(() => { })) },
    users: {
      info: jest.fn(() => Promise.resolve({
        user: { real_name: 'someName', profile: {} },
        token: 'sdf'
      })),
      profile: {
        get: jest.fn(() => Promise.resolve({
          profile: {
            tz_offset: 'someValue',
            email: 'sekito.ronald@andela.com'
          }
        }))
      }
    }
  }))
}));

describe('Slack controller test', () => {
  it('should return launch message', (done) => {
    request(app)
      .post('/api/v1/slack/command')
      .expect(200)
      .end((err, res) => {
        expect(res.body).toHaveProperty('text');
        expect(res.body).toHaveProperty('attachments');
        expect(res.body).toHaveProperty('response_type');
        expect(res.body).toEqual(SlackControllerMock);
        done();
      });
  })
})
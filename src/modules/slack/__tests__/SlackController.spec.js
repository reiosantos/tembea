import request from 'supertest';
import app from '../../../app';
import SlackControllerMock from '../__mocks__/SlackControllerMock';
import SlackController from '../SlackController';
import TeamDetailsService from '../../../services/TeamDetailsService';
import Response from '../../../helpers/responseHelper';
import BugsnagHelper from '../../../helpers/bugsnagHelper';
import HttpError from '../../../helpers/errorHandler';

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
    },
    conversations: {
      list: jest.fn().mockReturnValue({
        channels: [{
          id: 'CE0F7SZNU',
          name: 'tembea-magicians',
          purpose: {
            value: 'This channel is for workspace-wide communication and announcements.'
          },
        }]
      })
    }
  }))
}));

describe('Slack controller test', () => {
  it('should return launch message', async () => {
    const res = await request(app)
      .post('/api/v1/slack/command');
    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty('text');
    expect(res.body).toHaveProperty('attachments');
    expect(res.body).toHaveProperty('response_type');
    expect(res.body).toEqual(SlackControllerMock);
  });

  it('should return the lunch meassage for the command /Tembea travel', async () => {
    const res = await request(app)
      .post('/api/v1/slack/command')
      .send({ text: ' travel ' });
    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty('text');
    expect(res.body).toHaveProperty('attachments');
    expect(res.body).toHaveProperty('response_type');
  });

  it('should return the lunch meassage for the command /Tembea route', async () => {
    const res = await request(app)
      .post('/api/v1/slack/command')
      .send({ text: 'route' });
    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty('text');
    expect(res.body).toHaveProperty('attachments');
    expect(res.body).toHaveProperty('response_type');
  });

  describe('getChannels', () => {
    beforeEach(() => {
      jest.spyOn(TeamDetailsService, 'getTeamDetailsByTeamUrl').mockResolvedValue({
        botToken: 'xxxxxxx',
      });
    });

    it('should respond with a list slack channels', async () => {
      const res = await request(app)
        .get('/api/v1/slack/channels')
        .set('teamUrl', 'XXXXX');
      expect(res.status).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Request was successful');
      expect(res.body).toHaveProperty('data', [{
        id: 'CE0F7SZNU',
        name: 'tembea-magicians',
        description: 'This channel is for workspace-wide communication and announcements.',
      }]);
    });

    it('should fetch all channels on the workspace', async () => {
      jest.spyOn(Response, 'sendResponse').mockReturnValue();
      const req = { query: {} };
      const res = { locals: { botToken: 'token' } };
      await SlackController.getChannels(req, res);
      expect(Response.sendResponse).toHaveBeenCalled();
    });
    it('should handle error occurence', async () => {
      jest.spyOn(BugsnagHelper, 'log').mockReturnValue();
      jest.spyOn(HttpError, 'sendErrorResponse').mockReturnValue();
      
      const req = { query: {} };
      await SlackController.getChannels(req, {});
      expect(BugsnagHelper.log).toHaveBeenCalled();
      expect(HttpError.sendErrorResponse).toHaveBeenCalled();
    });
  });
});

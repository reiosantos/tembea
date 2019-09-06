import request from 'supertest';
import RouteService from '../../../services/RouteService';
import UserService from '../../../services/UserService';
import app from '../../../app';
import SlackControllerMock from '../__mocks__/SlackControllerMock';
import SlackController from '../SlackController';
import TeamDetailsService from '../../../services/TeamDetailsService';
import Response from '../../../helpers/responseHelper';
import BugsnagHelper from '../../../helpers/bugsnagHelper';
import HttpError from '../../../helpers/errorHandler';
import HomebaseService from '../../../services/HomebaseService';
import SlackHelpers from '../../../helpers/slack/slackHelpers';
import { SlackInteractiveMessage } from '../SlackModels/SlackMessageModels';

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
  beforeEach(() => {
    jest.spyOn(HomebaseService, 'getHomeBaseBySlackId').mockResolvedValue(
      { id: 1, name: 'Nairobi' }
    );
    jest.spyOn(SlackHelpers, 'findOrCreateUserBySlackId').mockReturnValue({});
  });


  it('should return launch message', (done) => {
    request(app)
      .post('/api/v1/slack/command')
      .end((err, res) => {
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('text');
        expect(res.body).toHaveProperty('attachments');
        expect(res.body).toHaveProperty('response_type');
        expect(res.body).toEqual(SlackControllerMock);
      }, done());
  });

  it('should return the lunch message for the command /Tembea travel', async () => {
    await request(app)
      .post('/api/v1/slack/command')
      .send({ text: ' travel ' })
      .then((res) => {
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('text');
        expect(res.body).toHaveProperty('attachments');
        expect(res.body).toHaveProperty('response_type');
      });
  });

  it('should return the lunch meassage for the command /Tembea route', async () => {
    await request(app)
      .post('/api/v1/slack/command')
      .send({ text: 'route' })
      .then((res) => {
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('text');
        expect(res.body).toHaveProperty('attachments');
        expect(res.body).toHaveProperty('response_type');
      });
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
    it('should not limit routes to only users with Nairobi Homebase', async () => {
      jest.spyOn(HomebaseService, 'getHomeBaseBySlackId').mockResolvedValue(
        { id: 1, name: 'Kampala' }
      );
      expect(await SlackController.getRouteCommandMsg()).toMatchObject(
        {
          text: '>*`The route functionality is not supported for your current location`*'
            .concat('\nThank you for using Tembea! See you again.')
        }
      );
    });
  });
});
describe('leaveRoute', () => {
  it('should remove an engineer from a route', async () => {
    jest.spyOn(UserService, 'getUserBySlackId').mockResolvedValue(
      { dataValues: { routeBatchId: 1, name: 'Route name', id: 2 } }
    );
    jest.spyOn(RouteService, 'getRouteBatchByPk').mockResolvedValue(
      { routeId: 1 }
    );
    jest.spyOn(RouteService, 'getRouteById').mockResolvedValue(
      { name: 'Route name' }
    );
    const payload = { user: { id: 'uuuuucu' } };
      
    const res = jest.fn();
    await SlackController.leaveRoute(payload, res);
    const slackMessage = new SlackInteractiveMessage('Hey *Route name*, You have successfully left the route `Route name`.');
    expect(res).toHaveBeenCalled();
    expect(res).toHaveBeenCalledWith(slackMessage);
  });
      
  it('should throw an error if something unexpected happens while removing an engineer from a route', async () => {
    jest.spyOn(BugsnagHelper, 'log').mockReturnValue();
    jest.spyOn(UserService, 'getUserBySlackId').mockResolvedValue(Promise.reject());
    const payload = { user: { id: 'uuuuucu' } };
    const res = jest.fn();
    await SlackController.leaveRoute(payload, res);
    const slackMessage = new SlackInteractiveMessage('Something went wrong! Please try again.');
    expect(res).toHaveBeenCalledWith(slackMessage);
  });
});

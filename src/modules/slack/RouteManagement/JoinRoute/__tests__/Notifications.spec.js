import JoinRouteHelpers from '../JoinRouteHelpers';
import { SlackAttachment } from '../../../SlackModels/SlackMessageModels';
import JoinRouteNotifications from '../JoinRouteNotifications';
import TeamDetailsService from '../../../../../services/TeamDetailsService';
import SlackNotifications from '../../../SlackPrompts/Notifications';
import Cache from '../../../../../cache';
import RouteService from '../../../../../services/RouteService';
import SlackHelpers from '../../../../../helpers/slack/slackHelpers';
import { mockRouteData } from '../../../../../services/__mocks__';
import JoinRouteRequestService from '../../../../../services/JoinRouteRequestService';

describe('JoinRouteNotifications', () => {
  let addPropsSpy;
  beforeEach(() => {
    const engagementData = ['12/01/2018', '12/12/2022', 'Safaricom'];
    jest.spyOn(Cache, 'fetch').mockResolvedValue(engagementData);
    const slackAttachment = new SlackAttachment();
    jest.spyOn(JoinRouteHelpers, 'joinRouteAttachments')
      .mockResolvedValue(slackAttachment);
    addPropsSpy = jest.spyOn(slackAttachment, 'addOptionalProps');
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('sendFellowDetailsPreview', () => {
    it('should respond with a previewDetails interactive message', async () => {
      jest.spyOn(JoinRouteNotifications, 'generateJoinRouteFromSubmission')
        .mockResolvedValue({ test: 'test' });
      const payload = {
        callback_id: 'join_route_fellowDetails_1',
        user: { id: 'slackId' },
        team: { id: 'teamId' },
        state: JSON.stringify({ routeId: 123 }),
        submission: {
          partnerName: 'AAAAAA', workHours: 'BB:CC', startDate: '11/11/2019', endDate: '12/12/2019'
        }
      };
      await JoinRouteNotifications.sendFellowDetailsPreview(payload);
      expect(JoinRouteHelpers.joinRouteAttachments)
        .toHaveBeenCalledWith({ test: 'test' });
      expect(JoinRouteNotifications.generateJoinRouteFromSubmission).toBeCalledTimes(1);
      expect(addPropsSpy).toBeCalledTimes(1);
    });
  });

  describe('sendManagerJoinRequest', () => {
    beforeEach(() => {
      jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken').mockResolvedValue(1);
      jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue('id1');
      jest.spyOn(JoinRouteRequestService, 'getJoinRouteRequest').mockResolvedValue({});
    });
    it('should send manger notification', async () => {
      const payload = {
        user: { id: 'slackId' },
        team: { id: 'teamId' }
      };
      const spy = jest.spyOn(SlackNotifications, 'sendNotifications')
        .mockReturnValue();
      await JoinRouteNotifications.sendManagerJoinRequest(payload, 2);
      expect(addPropsSpy).toBeCalledTimes(1);
      expect(spy).toBeCalledTimes(1);
    });
  });

  describe('sendFilledCapacityJoinRequest', () => {
    let joinRouteRequestSubmission;
    beforeEach(() => {
      joinRouteRequestSubmission = {
        workHours: ''
      };
      jest.spyOn(Cache, 'fetch')
        .mockResolvedValueOnce({ joinRouteRequestSubmission });
      jest.spyOn(JoinRouteNotifications, 'generateJoinRouteFromSubmission')
        .mockResolvedValue('tempJoinRoute');
      jest.spyOn(JoinRouteHelpers, 'joinRouteAttachments')
        .mockReturnValue(['attachments']);
      jest.spyOn(TeamDetailsService, 'getTeamDetails')
        .mockResolvedValue({ botToken: 'botToken', opsChannelId: 'opsChannelId' });
      jest.spyOn(SlackNotifications, 'sendNotifications')
        .mockResolvedValue();
    });
    it('should send full capacity notification to ops', async () => {
      const data = {
        routeId: 1,
        teamId: 'teamId',
        requesterSlackId: 'slackId'
      };
      await JoinRouteNotifications.sendFilledCapacityJoinRequest(data);
      expect(Cache.fetch).toHaveBeenCalled();
      expect(JoinRouteHelpers.joinRouteAttachments)
        .toHaveBeenCalledWith('tempJoinRoute');

      expect(SlackNotifications.sendNotifications).toHaveBeenCalled();
      expect(SlackNotifications.sendNotifications.mock.calls[0][0])
        .toEqual('opsChannelId');
      expect(SlackNotifications.sendNotifications.mock.calls[0][1])
        .toEqual(['attachments']);
      expect(SlackNotifications.sendNotifications.mock.calls[0][3])
        .toEqual('botToken');
    });
  });

  describe('sendFilledCapacityJoinRequest', () => {
    let joinRouteRequestSubmission;
    let submission;
    beforeEach(() => {
      submission = { workHours: 'BB:CC' };
      joinRouteRequestSubmission = submission;
      jest.spyOn(Cache, 'saveObject')
        .mockResolvedValue({ joinRouteRequestSubmission });
      jest.spyOn(RouteService, 'getRouteBatchByPk')
        .mockResolvedValue(mockRouteData);
      jest.spyOn(SlackHelpers, 'findOrCreateUserBySlackId')
        .mockReturnValue({});
    });
    it('should send full capacity notification to ops', async () => {
      const engagementObject = {
        startDate: '12/01/2019',
        endDate: '12/07/2020',
        partnerName: 'Safaricom'
      };
      const result = await JoinRouteNotifications.generateJoinRouteFromSubmission(
        submission, 'routeId', 'slackId', 'teamId', engagementObject
      );
      expect(Cache.saveObject).toHaveBeenCalled();
      expect(RouteService.getRouteBatchByPk)
        .toHaveBeenCalledWith('routeId', true);
      expect(SlackHelpers.findOrCreateUserBySlackId)
        .toHaveBeenCalledWith('slackId', 'teamId');
      expect(result).toHaveProperty('routeBatch');
      expect(result).toHaveProperty('engagement');
      expect(result.engagement).toHaveProperty('fellow');
      expect(result.engagement).toHaveProperty('partner');
      expect(result.engagement).toHaveProperty('workHours');
      expect(result.engagement).toHaveProperty('startDate');
      expect(result.engagement).toHaveProperty('endDate');
    });
  });
});

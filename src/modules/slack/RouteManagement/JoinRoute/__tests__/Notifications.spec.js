import JoinRouteHelpers from '../JoinRouteHelpers';
import { SlackAttachment } from '../../../SlackModels/SlackMessageModels';
import JoinRouteNotifications from '../JoinRouteNotifications';
import TeamDetailsService from '../../../../../services/TeamDetailsService';
import SlackNotifications from '../../../SlackPrompts/Notifications';

describe('JoinRouteNotifications', () => {
  const respond = jest.fn();
  let fieldsOrActionsSpy;
  let addPropsSpy;
  beforeEach(() => {
    jest.spyOn(JoinRouteHelpers, 'joinRouteAttachments')
      .mockResolvedValue(new SlackAttachment());
    fieldsOrActionsSpy = jest.spyOn(SlackAttachment.prototype, 'addFieldsOrActions');
    addPropsSpy = jest.spyOn(SlackAttachment.prototype, 'addOptionalProps');
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('sendFellowDetailsPreview', () => {
    it('should respond with a previewDetails interactive message', async () => {
      const payload = { callback_id: 'join_route_fellowDetails_1' };
      await JoinRouteNotifications.sendFellowDetailsPreview(payload, respond);
      expect(fieldsOrActionsSpy).toBeCalledTimes(2);
      expect(addPropsSpy).toBeCalledTimes(2);
      expect(respond).toBeCalledTimes(1);
    });
  });

  describe('sendManagerJoinRequest', () => {
    let sendNotificationSpy;
    beforeEach(() => {
      jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken').mockResolvedValue(1);
      jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue('id1');
      sendNotificationSpy = jest.spyOn(SlackNotifications, 'sendNotifications')
        .mockImplementation(jest.fn());
    });
    it('should send manger notification', async () => {
      const payload = {
        user: { id: 'slackId' },
        team: { id: 'teamId' }
      };
      await JoinRouteNotifications.sendManagerJoinRequest(payload, 1);
      expect(fieldsOrActionsSpy).toBeCalledTimes(1);
      expect(addPropsSpy).toBeCalledTimes(1);
      expect(sendNotificationSpy).toBeCalledTimes(1);
    });
  });
});

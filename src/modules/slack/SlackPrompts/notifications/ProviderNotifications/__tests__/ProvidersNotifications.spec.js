import SlackNotifications from '../../../Notifications';
import ProviderAttachmentHelper from '../helper';
import ProviderNotifications from '../index';
import TeamDetailsService from '../../../../../../services/TeamDetailsService';
import SlackAttachment from '../../OperationsRouteRequest/__mocks__/SlackAttachment.mock';
import AttachmentHelper from '../../AttachmentHelper';
import bugsnagHelper from '../../../../../../helpers/bugsnagHelper';

describe('ProviderNotifications', () => {
  const routeDetails = { Provider: '1, chirchir, 2' };
  const slackBotOauthToken = 'random';
  const data = { title: 'test', color: 'red' };
  const chanelId = 'ZHWKL';
  const submission = 'test';
  const result = { botToken: 'test' };
  const mockRouteAttachment = SlackAttachment;
  mockRouteAttachment.addOptionalProps = jest.fn();
  const routeRequest = {
    status: 'Approved',
    engagement: {
      fellow: { email: 'kelvin.chirchir@andela.com', name: 'chirchir' },
    },
    busStop: { address: 'Mirema' },
    home: { address: 'Mirema' }
  };

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('sendProviderRouteRequest', () => {
    beforeEach(() => {
      jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue({});
      jest.spyOn(ProviderAttachmentHelper, 'createProviderRouteAttachment');
      jest.spyOn(SlackNotifications, 'sendNotification').mockReturnValue({});
    });

    it('should return provider notification', async () => {
      jest.spyOn(TeamDetailsService, 'getTeamDetailsByTeamUrl');
      await ProviderNotifications.sendRouteRequestNotification(
        routeRequest, slackBotOauthToken, routeDetails
      );
      expect(SlackNotifications.getDMChannelId).toHaveBeenCalled();
      expect(ProviderAttachmentHelper.createProviderRouteAttachment).toHaveBeenCalled();
    });


    it('should return provider notification when token not provided', async () => {
      jest.spyOn(TeamDetailsService, 'getTeamDetailsByTeamUrl').mockResolvedValue(result);
      await ProviderNotifications.sendRouteRequestNotification(
        routeRequest, null, routeDetails
      );
    });

    it('should handle errors', async (done) => {
      jest.spyOn(bugsnagHelper, 'log');
      await ProviderNotifications.sendRouteRequestNotification();
      expect(bugsnagHelper.log).toHaveBeenCalledTimes(1);
      done();
    });
  });

  describe('ProviderAttachmentHelper', () => {
    beforeEach(() => {
      AttachmentHelper.getStatusLabels = jest.fn(() => (data));
      AttachmentHelper.routeRequestAttachment = jest.fn(() => (mockRouteAttachment));
      jest.spyOn(
        ProviderAttachmentHelper, 'routeInfoAttachment'
      ).mockReturnValue(mockRouteAttachment);
      jest.spyOn(SlackNotifications, 'createDirectMessage');
    });

    it('should get provider route attachment', () => {
      ProviderAttachmentHelper.createProviderRouteAttachment(routeRequest, chanelId, submission);

      expect(AttachmentHelper.getStatusLabels).toHaveBeenCalledWith(
        routeRequest.status, 'Approved'
      );
      expect(ProviderAttachmentHelper.routeInfoAttachment).toHaveBeenCalledWith(submission);
      expect(SlackNotifications.createDirectMessage).toHaveBeenCalled();
    });
  });
});

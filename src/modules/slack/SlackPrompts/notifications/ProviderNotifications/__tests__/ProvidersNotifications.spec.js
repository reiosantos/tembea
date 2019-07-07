import SlackNotifications from '../../../Notifications';
import ProviderAttachmentHelper from '../helper';
import ProviderService from '../../../../../../services/ProviderService';
import ProviderNotifications from '../index';
import TeamDetailsService from '../../../../../../services/TeamDetailsService';
import SlackAttachment from '../../OperationsRouteRequest/__mocks__/SlackAttachment.mock';
import AttachmentHelper from '../../AttachmentHelper';
import bugsnagHelper from '../../../../../../helpers/bugsnagHelper';
import responseData from '../../../__mocks__/NotificationResponseMock';
import { mockRouteRequestData, mockExistingProvider } from '../../../../../../services/__mocks__';
import InteractivePrompts from '../../../InteractivePrompts';
import Cache from '../../../../../../cache';
import UserService from '../../../../../../services/UserService';
import { driverService } from '../../../../../../services/DriverService';
import {
  driver, user, route, reassignDriverPayload, cab, reassignCabPayload
} from '../../../../RouteManagement/__mocks__/providersController.mock';
import { cabService } from '../../../../../../services/CabService';

describe('ProviderNotifications', () => {
  const routeDetails = { Provider: '1, chirchir, 2', teamUrl: 'ewww.asasa.s' };
  const data = {
    title: 'test', color: 'red', action: 'DDSD', emoji: 'LAOA'
  };
  const chanelId = 'ZHWKL';
  const submission = {
    routeName: 'Yaba',
    routeCapacity: 12,
    takeOffTime: '12:30',
    regNumber: 'JKEO284',
    provider: {
      providerUserId: 1
    },
    driverNumber: 78978768,
    driverId: 2,
    driverPhoneNo: 9808787797998,
    driverName: 'James'

  };
  const routeRequest = {
    dataValues: {
      id: 2
    },
    status: 'Approved',
    engagement: {
      fellow: { slackId: 'AKAKA', email: 'kelvin.chirchir@andela.com', name: 'chirchir' },
    },
    busStop: { address: 'Mirema' },
    home: { address: 'Mirema' },
    manager: { slackId: 'Deo' }
  };
  const botToken = 'XXXXXX';
  let requestData;
  const mockRouteAttachment = SlackAttachment;
  mockRouteAttachment.addOptionalProps = jest.fn();
  mockRouteAttachment.addFieldsOrActions = jest.fn();

  beforeEach(() => {
    jest.spyOn(Cache, 'fetch').mockResolvedValue(
      ['12/01/2019', '12/12/2022', 'Safaricom']
    );
    jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue({ chanelId });
    jest.spyOn(InteractivePrompts, 'messageUpdate').mockResolvedValue({});
    jest.spyOn(SlackNotifications, 'sendNotification').mockReturnValue({});
    jest.spyOn(bugsnagHelper, 'log');
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('Attachment tests', () => {
    beforeEach(() => {
      jest.spyOn(ProviderAttachmentHelper, 'getFellowApproveAttachment').mockReturnValue('token');
      jest.spyOn(ProviderAttachmentHelper, 'getManagerApproveAttachment').mockReturnValue('token');
      jest.spyOn(ProviderAttachmentHelper, 'getProviderCompleteAttachment').mockReturnValue('token');
    });

    describe('completeProviderApproveActions', () => {
      const channelId = 'channelId';
      const timestamp = 'timestamp';
      const teamId = 'YYYYYYYY';
      jest.spyOn(ProviderNotifications, 'sendToOpsDept');
      jest.spyOn(ProviderNotifications, 'sendProviderApproveMessageToFellow');
      jest.spyOn(ProviderNotifications, 'sendProviderApproveMessageToManager');
      it('should complete the approve new route action', async () => {
        requestData = {
          ...mockRouteRequestData,
          status: 'Approved',
        };
        await ProviderNotifications.completeProviderApprovedAction(
          requestData, channelId, teamId, timestamp, botToken, submission, false
        );
        expect(InteractivePrompts.messageUpdate).toHaveBeenCalled();
        expect(ProviderNotifications.sendToOpsDept).toHaveBeenCalled();
        expect(ProviderNotifications.sendProviderApproveMessageToFellow).toHaveBeenCalled();
        expect(ProviderNotifications.sendProviderApproveMessageToManager).toHaveBeenCalled();
        expect(ProviderAttachmentHelper.getProviderCompleteAttachment).toHaveBeenCalled();
      });
    });

    describe('sendProviderApprovedMessageToFellow', () => {
      beforeEach(() => {
        requestData = {
          ...mockRouteRequestData,
          status: 'Approved',
        };
      });
      it('should send  providers approve notification to fellow', async () => {
        await ProviderNotifications.sendProviderApproveMessageToFellow(
          requestData, botToken, submission
        );
        expect(SlackNotifications.getDMChannelId).toHaveBeenCalledTimes(1);
        expect(ProviderAttachmentHelper.getFellowApproveAttachment).toHaveBeenCalledTimes(1);
        expect(SlackNotifications.sendNotification).toHaveBeenCalled();
      });

      it('should catch errors', async () => {
        jest.spyOn(ProviderAttachmentHelper, 'getFellowApproveAttachment')
          .mockRejectedValue('an error');
        await ProviderNotifications.sendProviderApproveMessageToFellow(
          requestData, botToken, submission
        );
        expect(bugsnagHelper.log).toHaveBeenCalled();
      });
    });

    describe('sendProviderApprovedMessageToManager', () => {
      beforeEach(() => {
        requestData = {
          ...mockRouteRequestData,
          status: 'Approved',
        };
      });
      it('should send providers approve notification to manager', async () => {
        await ProviderNotifications.sendProviderApproveMessageToManager(
          requestData, botToken, submission
        );
        expect(SlackNotifications.getDMChannelId).toHaveBeenCalled();
        expect(ProviderAttachmentHelper.getManagerApproveAttachment).toHaveBeenCalled();
        expect(SlackNotifications.sendNotification).toHaveBeenCalled();
      });

      it('should catch errors', async () => {
        SlackNotifications.getDMChannelId
          .mockRejectedValue(new Error('Failed'));
        await ProviderNotifications.sendProviderApproveMessageToManager(
          requestData, botToken, submission
        );
        expect(bugsnagHelper.log.mock.calls[0][0].message).toEqual('Failed');
      });
      it('should send a notification the ops department from the provider', async () => {
        jest.spyOn(TeamDetailsService, 'getTeamDetails');
        await ProviderNotifications.sendToOpsDept(requestData, 'JJJJJ', botToken, submission);
        expect(TeamDetailsService.getTeamDetails).toBeCalled();
        expect(ProviderAttachmentHelper.getManagerApproveAttachment).toBeCalled();
        expect(SlackNotifications.sendNotification).toBeCalled();
      });
    });
  });
  describe('sendProviderRouteRequest', () => {
    beforeEach(() => {
      jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue({});
      const sendNotification = jest.spyOn(SlackNotifications, 'sendNotification');
      jest.spyOn(bugsnagHelper, 'log');
      sendNotification.mockImplementation(() => { throw new Error('Dummy error'); });
      jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue({});
      jest.spyOn(ProviderAttachmentHelper, 'createProviderRouteAttachment');
      jest.spyOn(SlackNotifications, 'sendNotification').mockReturnValue({});
    });
    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it('should return provider notification', async () => {
      jest.spyOn(TeamDetailsService, 'getTeamDetailsByTeamUrl');
      await ProviderNotifications.sendRouteRequestNotification(
        routeRequest, '', submission
      );
      expect(TeamDetailsService.getTeamDetailsByTeamUrl).toBeCalled();
      expect(SlackNotifications.getDMChannelId).toHaveBeenCalled();
      expect(ProviderAttachmentHelper.createProviderRouteAttachment).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      jest.spyOn(TeamDetailsService, 'getTeamDetailsByTeamUrl').mockRejectedValue(new Error('Dummy error'));
      await ProviderNotifications.sendRouteRequestNotification(routeRequest, null, routeDetails);
      expect(bugsnagHelper.log).toHaveBeenCalledTimes(1);
    });
  });

  describe('ProviderAttachmentHelper', () => {
    beforeEach(() => {
      jest.spyOn(ProviderAttachmentHelper, 'getFellowApproveAttachment');
      jest.spyOn(ProviderAttachmentHelper, 'getManagerApproveAttachment');
      jest.spyOn(ProviderAttachmentHelper, 'getProviderCompleteAttachment');
      AttachmentHelper.getStatusLabels = jest.fn(() => (data));
      AttachmentHelper.addFieldsOrActions = jest.fn(() => (data));
      AttachmentHelper.routeRequestAttachment = jest.fn(() => (mockRouteAttachment));
      jest.spyOn(
        ProviderAttachmentHelper, 'routeInfoAttachment'
      ).mockReturnValue(mockRouteAttachment);
      jest.spyOn(
        ProviderAttachmentHelper, 'providerRouteInformation'
      );
      jest.spyOn(
        AttachmentHelper, 'engagementAttachment'
      ).mockResolvedValue(mockRouteAttachment);
      jest.spyOn(SlackNotifications, 'createDirectMessage');
    });

    it('should get provider route attachment', () => {
      ProviderAttachmentHelper.createProviderRouteAttachment(routeRequest, chanelId, submission);

      expect(AttachmentHelper.getStatusLabels).toHaveBeenCalledWith(
        routeRequest.status, 'Confirmed'
      );
      expect(ProviderAttachmentHelper.routeInfoAttachment).toHaveBeenCalledWith(submission);
      expect(SlackNotifications.createDirectMessage).toHaveBeenCalled();
    });

    it('should get manager approve attachment', () => {
      ProviderAttachmentHelper.getManagerApproveAttachment(routeRequest, chanelId, submission, true);

      expect(AttachmentHelper.getStatusLabels).toHaveBeenCalledWith(
        routeRequest.status, 'Approved'
      );
      expect(ProviderAttachmentHelper.providerRouteInformation).toHaveBeenCalledWith(submission);
      expect(AttachmentHelper.engagementAttachment).toHaveBeenCalled();
    });

    it('should get fellow approve attachment', () => {
      ProviderAttachmentHelper.getFellowApproveAttachment(routeRequest, chanelId, submission, true);

      expect(AttachmentHelper.getStatusLabels).toHaveBeenCalledWith(
        routeRequest.status, 'Approved'
      );
      expect(AttachmentHelper.routeRequestAttachment).toHaveBeenCalled();
      expect(ProviderAttachmentHelper.providerRouteInformation).toHaveBeenCalledWith(submission);
      expect(AttachmentHelper.engagementAttachment).toHaveBeenCalled();
    });

    it('should get fellow approve attachment', () => {
      ProviderAttachmentHelper.getFellowApproveAttachment(routeRequest, chanelId, submission, true);

      expect(AttachmentHelper.getStatusLabels).toHaveBeenCalledWith(
        routeRequest.status, 'Approved'
      );
      expect(AttachmentHelper.routeRequestAttachment).toHaveBeenCalled();
      expect(ProviderAttachmentHelper.providerRouteInformation).toHaveBeenCalledWith(submission);
      expect(AttachmentHelper.engagementAttachment).toHaveBeenCalled();
    });

    it('should get provider complete attachment', () => {
      jest.spyOn(ProviderAttachmentHelper, 'providerRouteInformation');
      ProviderAttachmentHelper.getProviderCompleteAttachment('asdasd', 'Complete', routeRequest, submission);

      expect(AttachmentHelper.routeRequestAttachment).toHaveBeenCalled();
      expect(ProviderAttachmentHelper.providerRouteInformation).toHaveBeenCalledWith(submission);
    });

    it('should create provider route information', () => {
      const routeInformationAttachment = ProviderAttachmentHelper.providerRouteInformation(submission);
      expect(routeInformationAttachment).toEqual({
        actions: [],
        attachment_type: undefined,
        author_icon: undefined,
        author_name: undefined,
        color: undefined,
        fields: [{ short: true, title: 'Driver Name', value: 'James' },
          { short: true, title: 'Driver Phone Number', value: undefined },
          { short: true, title: 'Route Name', value: 'Yaba' },
          { short: true, title: 'Route Capacity', value: 12 },
          { short: true, title: '*`Take-off Time`*', value: '12:30 PM' },
          { short: true, title: 'Cab Registration Number', value: 'JKEO284' }],
        image_url: undefined,
        mrkdwn_in: [],
        text: undefined,
        title: ''
      });
    });
  });
});

describe('Provider notifications', () => {
  it('Should update provider notification', async () => {
    const tripDetails = responseData;
    const [channel, botToken, trip, timeStamp, driverDetails] = [
      'cpd33', 'xxop', tripDetails, '1555500000', 'duude, 090909090, 999999'];
    jest.spyOn(ProviderService, 'findProviderByPk').mockResolvedValue({ name: 'Uber' });
    const providerFieldMock = jest.spyOn(ProviderAttachmentHelper, 'providerFields');
    await ProviderNotifications.UpdateProviderNotification(
      channel, botToken, trip, timeStamp, driverDetails
    );
    expect(providerFieldMock).toHaveBeenCalled();
  });
});

describe('sendProviderReasignDriverMessage', () => {
  it('Should send provider update notification', async () => {
    jest.spyOn(ProviderService, 'findProviderByPk').mockResolvedValue(mockExistingProvider);
    jest.spyOn(UserService, 'getUserById').mockResolvedValue(user);
    jest.spyOn(TeamDetailsService, 'getTeamDetailsByTeamUrl').mockResolvedValue('xoop-ou99');
    jest.spyOn(driverService, 'getPaginatedItems').mockResolvedValue({ data: [driver] });
    jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue('CATX99');
    jest.spyOn(SlackNotifications, 'sendNotification').mockResolvedValue({});

    await ProviderNotifications.sendProviderReasignDriverMessage(driver, [route], 'adaeze.slack.com');
    expect(ProviderService.findProviderByPk).toHaveBeenCalled();
    expect(TeamDetailsService.getTeamDetailsByTeamUrl).toHaveBeenCalled();
    expect(UserService.getUserById).toHaveBeenCalled();
    expect(driverService.getPaginatedItems).toHaveBeenCalled();
    expect(SlackNotifications.getDMChannelId).toHaveBeenCalled();
    expect(SlackNotifications.sendNotification).toHaveBeenCalled();
  });
});

describe('updateProviderReasignDriverMessage', () => {
  it('Should update provider reassign message', async () => {
    const {
      channel: { id: channelId },
      original_message: { ts: timestamp }
    } = reassignDriverPayload;
    jest.spyOn(InteractivePrompts, 'messageUpdate').mockResolvedValue();

    await ProviderNotifications.updateProviderReasignDriverMessage(
      channelId, 'xoob', timestamp, route, driver
    );
    expect(InteractivePrompts.messageUpdate).toHaveBeenCalled();
  });
  it('Should throw an error', async () => {
    const {
      channel: { id: channelId },
      original_message: { ts: timestamp }
    } = reassignDriverPayload;
    jest.spyOn(InteractivePrompts, 'messageUpdate').mockRejectedValue();
    jest.spyOn(bugsnagHelper, 'log');

    await ProviderNotifications.updateProviderReasignDriverMessage(
      channelId, 'xoob', timestamp, route, driver
    );
    expect(bugsnagHelper.log).toHaveBeenCalled();
  });
});

describe('provider cab reassignnment', () => {
  beforeEach(() => {
    jest.spyOn(ProviderService, 'findProviderByPk').mockResolvedValue(mockExistingProvider);
    jest.spyOn(UserService, 'getUserById').mockResolvedValue({ slackId: 'kdjfj' });
    jest.spyOn(TeamDetailsService, 'getTeamDetailsByTeamUrl').mockResolvedValue('xoxb-47865');
    jest.spyOn(cabService, 'getCabs').mockResolvedValue({ data: [cab] });
    jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue('UDWHS123');
    jest.spyOn(SlackNotifications, 'sendNotification').mockResolvedValue();
  });
  afterEach(async () => {
    jest.restoreAllMocks();
  });


  it('should notify the provider of the cab deletion', async () => {
    await ProviderNotifications.sendVehicleRemovalProviderNotification(cab, [route], 'segun-andela.slack.com');
    expect(ProviderService.findProviderByPk).toHaveBeenCalled();
    expect(UserService.getUserById).toHaveBeenCalled();
    expect(TeamDetailsService.getTeamDetailsByTeamUrl).toHaveBeenCalled();
    expect(cabService.getCabs).toHaveBeenCalled();
    expect(SlackNotifications.getDMChannelId).toHaveBeenCalled();
    expect(SlackNotifications.sendNotification).toHaveBeenCalled();
  });

  it('should enter the catch block', async () => {
    jest.spyOn(bugsnagHelper, 'log');
    jest.spyOn(ProviderService, 'findProviderByPk').mockRejectedValue({});
    await ProviderNotifications.sendVehicleRemovalProviderNotification(cab, [route]);
    expect(bugsnagHelper.log).toHaveBeenCalled();
  });
});

describe('updateProviderReAssignCabMessage ', () => {
  it('Should update provider reassign message', async () => {
    const {
      channel: { id: channelId },
      original_message: { ts: timestamp }
    } = reassignCabPayload;
    jest.spyOn(InteractivePrompts, 'messageUpdate').mockResolvedValue();

    await ProviderNotifications.updateProviderReAssignCabMessage(
      channelId, 'moon', timestamp, route, cab
    );
    expect(InteractivePrompts.messageUpdate).toHaveBeenCalled();
  });

  it('Should throw an error', async () => {
    const {
      channel: { id: channelId },
      original_message: { ts: timestamp }
    } = reassignCabPayload;

    jest.spyOn(InteractivePrompts, 'messageUpdate').mockRejectedValue();
    jest.spyOn(bugsnagHelper, 'log');

    await ProviderNotifications.updateProviderReAssignCabMessage(
      channelId, 'moon', timestamp, route, cab
    );
    expect(bugsnagHelper.log).toHaveBeenCalled();
  });
});

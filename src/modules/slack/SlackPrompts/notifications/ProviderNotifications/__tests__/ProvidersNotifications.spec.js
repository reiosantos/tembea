import SlackNotifications from '../../../Notifications';
import ProviderAttachmentHelper from '../helper';
import ProviderService from '../../../../../../services/ProviderService';
import ProviderNotifications from '../index';
import TeamDetailsService from '../../../../../../services/TeamDetailsService';
import SlackAttachment from '../../OperationsRouteRequest/__mocks__/SlackAttachment.mock';
import AttachmentHelper from '../../AttachmentHelper';
import bugsnagHelper from '../../../../../../helpers/bugsnagHelper';
import responseData from '../../../__mocks__/NotificationResponseMock';
import { mockExistingProvider } from '../../../../../../services/__mocks__';
import InteractivePrompts from '../../../InteractivePrompts';
import Cache from '../../../../../../cache';
import UserService from '../../../../../../services/UserService';
import { driverService } from '../../../../../../services/DriverService';
import {
  driver, user, route, reassignDriverPayload, cab, reassignCabPayload
} from '../../../../RouteManagement/__mocks__/providersController.mock';
import { cabService } from '../../../../../../services/CabService';
import OpsAttachmentHelper from '../../OperationsRouteRequest/helper';

describe('ProviderNotifications', () => {
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
    Provider: '1,Uber Kenya,16',
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
  });

  describe('sendTripRouteRequest', () => {
    beforeEach(() => {
      jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue({});
      const sendNotification = jest.spyOn(SlackNotifications, 'sendNotification');
      jest.spyOn(bugsnagHelper, 'log');
      sendNotification.mockImplementation(() => { throw new Error('Dummy error'); });
      jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue({});
      jest.spyOn(SlackNotifications, 'sendNotification').mockReturnValue({});
    });
    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it('should return provider notification', async () => {
      jest.spyOn(ProviderService, 'getProviderByUserId');
      jest.spyOn(ProviderService, 'getProviderBySlackId').mockResolvedValue({
        isDirectMessage: true,
        chanelId: 'CHANID'
      });
      await ProviderNotifications.sendTripNotification(
        1, 'test', 'testtoken', {
          ...responseData,
          id: 1,
          origin: { address: 'Home' },
          destination: { address: 'Office' },
          rider: { name: 'My name', phoneNo: '080123454' },
          createdAt: new Date(),
        }
      );
      expect(SlackNotifications.sendNotification).toBeCalled();
      expect(SlackNotifications.getDMChannelId).toHaveBeenCalled();
    });
  });

  describe('ProviderAttachmentHelper', () => {
    beforeEach(() => {
      jest.spyOn(ProviderAttachmentHelper, 'getFellowApproveAttachment');
      jest.spyOn(ProviderAttachmentHelper, 'getManagerApproveAttachment');
      jest.spyOn(ProviderAttachmentHelper, 'getProviderCompleteAttachment');
      jest.spyOn(OpsAttachmentHelper, 'opsRouteInformation');
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

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should get provider route attachment', () => {
      ProviderAttachmentHelper.createProviderRouteAttachment(routeRequest, chanelId, submission);

      expect(AttachmentHelper.getStatusLabels).toHaveBeenCalledWith(
        routeRequest.status, 'Confirmed'
      );
      expect(ProviderAttachmentHelper.routeInfoAttachment).toHaveBeenCalledWith(submission);
      expect(SlackNotifications.createDirectMessage).toHaveBeenCalled();
    });

    it('should get manager approve attachment', async () => {
      await ProviderAttachmentHelper.getManagerApproveAttachment(routeRequest, chanelId, true, submission);

      expect(AttachmentHelper.getStatusLabels).toHaveBeenCalledWith(
        routeRequest.status, 'Approved'
      );
      expect(AttachmentHelper.routeRequestAttachment).toHaveBeenCalled();
      expect(OpsAttachmentHelper.opsRouteInformation).toHaveBeenCalledWith(submission);
      expect(AttachmentHelper.engagementAttachment).toHaveBeenCalled();
    });

    it('should get fellow approve attachment', () => {
      ProviderAttachmentHelper.getFellowApproveAttachment(routeRequest, chanelId, submission);

      expect(AttachmentHelper.getStatusLabels).toHaveBeenCalledWith(
        routeRequest.status, 'Approved'
      );
      expect(AttachmentHelper.routeRequestAttachment).toHaveBeenCalled();
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
    jest.spyOn(InteractivePrompts, 'messageUpdate').mockResolvedValue();
    const tripDetails = responseData;
    const [channel, botToken, trip, timeStamp] = [
      'cpd33', 'xxop', tripDetails, '1555500000'];
    jest.spyOn(ProviderService, 'findByPk').mockResolvedValue({ name: 'Uber' });
    const providerFieldMock = jest.spyOn(ProviderAttachmentHelper, 'providerFields');
    await ProviderNotifications.UpdateProviderNotification(
      channel, botToken, trip, timeStamp,
    );
    expect(providerFieldMock).toHaveBeenCalled();
  });
});

describe('sendProviderReasignDriverMessage', () => {
  it('Should send provider update notification', async () => {
    jest.spyOn(ProviderService, 'findByPk').mockResolvedValue(mockExistingProvider);
    jest.spyOn(UserService, 'getUserById').mockResolvedValue(user);
    jest.spyOn(TeamDetailsService, 'getTeamDetailsByTeamUrl').mockResolvedValue('xoop-ou99');
    jest.spyOn(driverService, 'getPaginatedItems').mockResolvedValue({ data: [driver] });
    jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue('CATX99');
    jest.spyOn(SlackNotifications, 'sendNotification').mockResolvedValue({});

    await ProviderNotifications.sendProviderReasignDriverMessage(driver, [route], 'adaeze.slack.com');
    expect(ProviderService.findByPk).toHaveBeenCalled();
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
    jest.spyOn(ProviderService, 'findByPk').mockResolvedValue(mockExistingProvider);
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
    await ProviderNotifications.sendVehicleRemovalProviderNotification(cab, [route],
      'segun-andela.slack.com');
    expect(ProviderService.findByPk).toHaveBeenCalled();
    expect(UserService.getUserById).toHaveBeenCalled();
    expect(cabService.getCabs).toHaveBeenCalled();
    expect(SlackNotifications.getDMChannelId).toHaveBeenCalled();
    expect(SlackNotifications.sendNotification).toHaveBeenCalled();
  });

  it('should enter the catch block', async () => {
    jest.spyOn(bugsnagHelper, 'log');
    jest.spyOn(ProviderService, 'findByPk').mockRejectedValue({});
    await ProviderNotifications.sendVehicleRemovalProviderNotification(cab, [route]);
    expect(bugsnagHelper.log).toHaveBeenCalled();
  });
});

describe("Provider's Trip Notification", () => {
  const teamDetails = { ...responseData };
  beforeEach(() => {
    jest.spyOn(bugsnagHelper, 'log').mockReturnValue();
    jest.spyOn(SlackNotifications, 'sendNotifications').mockResolvedValue({});
    jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue('SLACKID');
    jest.spyOn(SlackNotifications, 'notificationFields').mockResolvedValue({});
    jest.spyOn(SlackNotifications, 'sendNotification').mockResolvedValue({});
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  describe("Send Provider's Trip notification should throw an error", () => {
    beforeEach(() => {
      jest.spyOn(SlackNotifications, 'sendNotification').mockRejectedValue();
      jest.spyOn(ProviderService, 'getProviderBySlackId').mockResolvedValue({
        isDirectMessage: true,
        chanelId: 'CHANID'
      });
    });
    it('should call BugsnagHelper when an error ocuurs', async () => {
      await ProviderNotifications.sendTripNotification('SLACKID', 'NAME', 'BOT_TOKEN', teamDetails);
      expect(bugsnagHelper.log).toHaveBeenCalledTimes(1);
    });
  });

  describe("Send Provider's Trip notification to channel", () => {
    beforeEach(() => {
      jest.spyOn(ProviderService, 'getProviderBySlackId').mockResolvedValue({
        isDirectMessage: false,
        chanelId: 'CHANID'
      });
    });
    it('should send trip notification to channel', async () => {
      await ProviderNotifications.sendTripNotification('SLACKID', 'NAME', 'BOT_TOKEN', teamDetails);
      expect(SlackNotifications.sendNotifications).toHaveBeenCalled();
      expect(SlackNotifications.sendNotification).toHaveBeenCalledTimes(0);
    });
  });

  describe("Send Provider's Trip notification to Provider's DM", () => {
    beforeEach(() => {
      jest.spyOn(ProviderService, 'getProviderBySlackId').mockResolvedValue({
        isDirectMessage: true,
        chanelId: 'CHANID'
      });
    });
    it('should send trip notification to Provider dm', async () => {
      await ProviderNotifications.sendTripNotification('SLACKID', 'NAME', 'BOT_TOKEN', teamDetails);
      expect(SlackNotifications.sendNotifications).toHaveBeenCalledTimes(0);
      expect(SlackNotifications.sendNotification).toHaveBeenCalledTimes(1);
    });
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

describe('checkIsDirectMessage ', () => {
  it('Should return channelId if isDirectMessage is true', async () => {
    const providerDetails = { isDirectMessage: false, channelId: 'testChannel' };
    const slackId = 'sd245trfg';
    const channelId = ProviderNotifications.checkIsDirectMessage(providerDetails, slackId);
    expect(channelId).toEqual('testChannel');
  });
  it('Should return channelId if isDirectMessage is false', async () => {
    const providerDetails = { isDirectMessage: true, channelId: 'testChannel' };
    const slackId = 'sd245trfg';
    const channelId = ProviderNotifications.checkIsDirectMessage(providerDetails, slackId);
    expect(channelId).toEqual('sd245trfg');
  });
});
describe('sendRouteApprovalNotification', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('Should send a provider assign cab and driver notification', async () => {
    jest.spyOn(ProviderService, 'findByPk')
      .mockResolvedValue({ user: { name: 'Provider X', slackId: 'xoop-seas' } });
    jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue('UXXID');
    jest.spyOn(SlackNotifications, 'createDirectMessage').mockResolvedValue({});
    jest.spyOn(SlackNotifications, 'sendNotification').mockResolvedValue({});
    await ProviderNotifications.sendRouteApprovalNotification(route, 1, 'xoop');
    expect(ProviderService.findByPk).toHaveBeenCalled();
    expect(SlackNotifications.getDMChannelId).toHaveBeenCalled();
    expect(SlackNotifications.sendNotification).toHaveBeenCalled();
  });
  it('Should update provider approval notification', async () => {
    jest.spyOn(InteractivePrompts, 'messageUpdate').mockResolvedValue();
    await ProviderNotifications.updateRouteApprovalNotification(
      'UXXID', 'xoop', '1234567', SlackAttachment
    );
    expect(InteractivePrompts.messageUpdate).toHaveBeenCalled();
  });
});

import DriverService from '../../../../../../services/DriverService';
import driverNotifications from '../driver.notifications';
import TeamDetailsService from '../../../../../../services/TeamDetailsService';
import driverNotificationsHelper from '../driver.notifications.helper';
import Notifications from '../../../Notifications';
import { bugsnagHelper, SlackInteractiveMessage } from '../../../../RouteManagement/rootFile';
import { tripData } from './driver.notifications-helper.spec';

let driverServiceSpy: any;
const respond = jest.fn();
beforeEach(() => {
  jest.resetAllMocks();
});
describe('DriverNotifications.sendDriverTripApproveNotification', () => {
  beforeEach(() => {
    jest.spyOn(driverNotificationsHelper, 'tripApprovalAttachment').mockResolvedValue([tripData]);
    jest.spyOn(Notifications, 'getDMChannelId').mockImplementation(() => jest.fn());
    jest.spyOn(Notifications, 'createDirectMessage').mockImplementation(() => jest.fn());
    jest.spyOn(Notifications, 'sendNotification').mockImplementation(() => jest.fn());
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  it('should send Driver Trip ApproveNotification', async () => {
    jest.spyOn(TeamDetailsService, 'getTeamDetails').mockResolvedValue({ botToken: 'token' });
    await driverNotifications.sendDriverTripApproveNotification('team',
                                                                {}, 'UGGSa');
    expect(Notifications.getDMChannelId).toBeCalled();
    expect(Notifications.createDirectMessage).toBeCalled();
    expect(driverNotificationsHelper.tripApprovalAttachment).toBeCalled();
    expect(Notifications.sendNotification).toBeCalled();
  });
});
describe('DriverNotifications.checkAndNotifyDriver', () => {
  beforeEach(() => {
    jest.spyOn(TeamDetailsService, 'getTeamDetails').mockResolvedValue({ botToken: 'token' });
    driverServiceSpy = jest.spyOn(DriverService, 'findOneDriver');
    jest.spyOn(driverNotifications, 'checkAndNotifyDriver');
    jest.spyOn(driverNotifications, 'sendDriverTripApproveNotification')
    .mockImplementation(() => jest.fn());
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  it('should check and notify driver if they have a userId', async () => {
    driverServiceSpy.mockResolvedValue({ user: { slackId: 'UHHASAA' } });
    jest.spyOn(driverNotifications, 'sendDriverTripApproveNotification');
    const driver = { userId: 1, id: 1 };
    await driverNotifications.checkAndNotifyDriver(driver, 'UYDAA', {}, respond);
    expect(driverNotifications.sendDriverTripApproveNotification).toBeCalled();
    expect(respond).toBeCalled();
  });

  it('should not notify driver if they dont have a userId', async () => {
    const driver = { id: 1 };
    await driverNotifications.checkAndNotifyDriver(driver, 'UYDAA', {}, respond);
    expect(driverNotifications.sendDriverTripApproveNotification).not.toBeCalled();
  });
});

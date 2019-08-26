import DriverService from '../../../../../../services/DriverService';
import DriverNotifications from '../driver.notifications';
import TeamDetailsService from '../../../../../../services/TeamDetailsService';
import driverNotificationsHelper from '../driver.notifications.helper';
import Notifications from '../../../Notifications';
import { tripData } from './driver.notifications-helper.spec';
import { ITripRequest } from '../../../../../../database/models/interfaces/trip-request.interface';
import faker from 'faker';
import { TripStatus, TripTypes } from '../../../../../../database/models/trip-request';
import { IUser } from '../../../../../../database/models/interfaces/user.interface';

let driverServiceSpy: any;
const respond = jest.fn();

describe(DriverNotifications, () => {
  const testUser : IUser = {
    id: 2,
    name: faker.fake('{{name.firstName}}, {{name.lastName}}'),
    phoneNo: faker.phone.phoneNumber(),
    email: faker.internet.email(),
  };

  const testTripInfo: ITripRequest = {
    id: 1,
    origin: { address: faker.address.streetAddress() },
    destination: { address: faker.address.streetAddress() },
    tripStatus: TripStatus.approved,
    departureTime: faker.date.future().toISOString(),
    reason: faker.lorem.words(5),
    tripNote: faker.lorem.paragraphs(2),
    noOfPassengers: faker.random.number(10),
    driver: { id: 1, driverName: faker.name.firstName(), providerId: 2 },
    cab: { id: 1, capacity: 4, regNumber: faker.random.uuid(),
      model: faker.lorem.word(), providerId: 2 },
    riderId: testUser.id,
    rider: testUser,
    requestedById: testUser.id,
    requester: testUser,
    response_url: 'hello',
    tripType: TripTypes.regular,
    approver: testUser,
    department: { id: 1, name: 'Hello', headId: testUser.id, homebaseId: 2 },
    managerComment: faker.lorem.words(5),
    createdAt: faker.date.future().toISOString(),
    distance: '2.3km',
    driverSlackId: 'UKJKDL',
  };

  beforeEach(() => jest.resetAllMocks());

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
      await DriverNotifications.sendDriverTripApproveNotification('team', testTripInfo, 'UGGSa');
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
      jest.spyOn(DriverNotifications, 'checkAndNotifyDriver');
      jest.spyOn(DriverNotifications, 'sendDriverTripApproveNotification')
      .mockImplementation(() => jest.fn());
    });
    afterEach(() => {
      jest.resetAllMocks();
    });
    it('should check and notify driver if they have a userId', async () => {
      driverServiceSpy.mockResolvedValue({ user: { slackId: 'UHHASAA' } });
      jest.spyOn(DriverNotifications, 'sendDriverTripApproveNotification');
      const driver = { userId: 1, id: 1 };
      await DriverNotifications.checkAndNotifyDriver(driver, 'UYDAA', testTripInfo, respond);
      expect(DriverNotifications.sendDriverTripApproveNotification).toBeCalled();
      expect(respond).toBeCalled();
    });

    it('should not notify driver if they dont have a userId', async () => {
      const driver = { id: 1 };
      await DriverNotifications.checkAndNotifyDriver(driver, 'UYDAA', testTripInfo, respond);
      expect(DriverNotifications.sendDriverTripApproveNotification).not.toBeCalled();
    });
  });
});

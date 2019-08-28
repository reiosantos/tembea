import driverNotificationsHelper from '../driver.notifications.helper';
import { tripsMock } from '../../../../../../utils/__mocks__/ExportDataMocks';
import { BlockMessage } from '../../../../../new-slack/models/slack-block-models';

const [trip] = tripsMock();
delete trip.destination;
export const tripData = {
  ...trip,
  driverSlackId: 'Udadaaada',
  destination: {
    address:
        'Kira 1',
  },
  origin: { address: 'Kira 2' },
};
describe('DriverNotificationHelper', () => {
  describe('tripApprovalAttachment', () => {
    it('should return trip attachement for driver', () => {
      const attachment = driverNotificationsHelper.tripApprovalAttachment(tripData);
      expect(attachment).toBeDefined();
      expect(attachment).toBeInstanceOf(BlockMessage);
    });
  });
});

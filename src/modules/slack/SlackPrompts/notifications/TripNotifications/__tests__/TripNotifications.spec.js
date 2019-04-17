import TeamDetailsService from '../../../../../../services/TeamDetailsService';
import SlackNotifications from '../../../Notifications';
import { SlackAttachmentField } from '../../../../SlackModels/SlackMessageModels';
import TripNotifications from '..';


describe('TripNotifications', () => {
  it('should send notification', async () => {
    const trip = {
      rider: {
        slackId: 2
      },
      department: {
        teamId: 'TCPCFU4RF'
      },
      departureTime: '2019-03-27T14:10:00.000Z',
      reason: 'It is approved'
    };
    jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken')
      .mockResolvedValue('X0Xb-2345676543-hnbgrtg');
    jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue('CG6BU8BG8');
    jest.spyOn(SlackNotifications, 'notificationFields').mockReturnValue(
      new SlackAttachmentField('Trip Date', trip.departureTime, true),
      new SlackAttachmentField('Reason', trip.reason, true),
    );
    jest.spyOn(SlackNotifications, 'createDirectMessage').mockReturnValue({
      channelId: 'TCPCFU4RF',
      text: 'Hi! @kica Did you take this trip?',
      attachment: ['trip_completion', new SlackAttachmentField(
        'Reason', trip.reason, true
      )]
    });
    jest.spyOn(SlackNotifications, 'sendNotification').mockReturnValue({});
    await TripNotifications.sendCompletionNotification(trip);
    expect(SlackNotifications.sendNotification).toBeCalledTimes(1);
    expect(TeamDetailsService.getTeamDetailsBotOauthToken).toBeCalledWith('TCPCFU4RF');
    expect(SlackNotifications.notificationFields).toBeCalledWith(trip);
    expect(SlackNotifications.getDMChannelId).toBeCalledWith(2, 'X0Xb-2345676543-hnbgrtg');
  });
});

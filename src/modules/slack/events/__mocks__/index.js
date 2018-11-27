import { SlackEvents, slackEventNames } from '../slackEvents';

SlackEvents.handle(slackEventNames.DECLINED_TRIP_REQUEST,
  (ride, respond) => {
    respond({
      data: 'Notification sent'
    });
  });

export default SlackEvents;

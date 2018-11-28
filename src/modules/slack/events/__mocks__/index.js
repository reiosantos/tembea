import { SlackEvents, slackEventsNames } from '../slackEvents';

SlackEvents.handle(slackEventsNames.DECLINED_TRIP_REQUEST,
  (ride, respond) => {
    respond({
      data: 'Notification sent'
    });
  });

export default SlackEvents;

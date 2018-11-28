
import SlackNotifications from '../SlackPrompts/Notifications';
import { slackEventsNames, SlackEvents } from './slackEvents';

SlackEvents.handle(slackEventsNames.TRIP_APPROVED,
  SlackNotifications.sendOperationsTripRequestNotification);
SlackEvents.handle(slackEventsNames.TRIP_WAITING_CONFIRMATION,
  SlackNotifications.sendRequesterApprovedNotification);

SlackEvents.handle(slackEventsNames.NEW_TRIP_REQUEST,
  SlackNotifications.sendManagerTripRequestNotification);
SlackEvents.handle(slackEventsNames.DECLINED_TRIP_REQUEST,
  SlackNotifications.sendRequesterDeclinedNotification);

export default SlackEvents;

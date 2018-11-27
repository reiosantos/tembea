import { SlackEvents, slackEventNames } from './slackEvents';
import Notifications from '../SlackPrompts/Notifications';


SlackEvents.handle(slackEventNames.NEW_TRIP_REQUEST,
  Notifications.sendManagerTripRequestNotification);
SlackEvents.handle(slackEventNames.DECLINED_TRIP_REQUEST,
  Notifications.sendRequesterDeclinedNotification);

export default SlackEvents;

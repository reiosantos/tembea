import SlackNotifications from '../SlackPrompts/Notifications';
import { SlackEvents, slackEventNames } from './slackEvents';

const slackEvents = SlackEvents;

slackEvents.handle(slackEventNames.TRIP_APPROVED,
  SlackNotifications.sendOperationsTripRequestNotification);
slackEvents.handle(slackEventNames.TRIP_WAITING_CONFIRMATION,
  SlackNotifications.sendRequesterApprovedNotification);

slackEvents.handle(slackEventNames.NEW_TRIP_REQUEST,
  SlackNotifications.sendManagerTripRequestNotification);
slackEvents.handle(slackEventNames.DECLINED_TRIP_REQUEST,
  SlackNotifications.sendRequesterDeclinedNotification);
slackEvents.handle(slackEventNames.NEW_TRAVEL_TRIP_REQUEST,
  SlackNotifications.sendOperationsTripRequestNotification);

export default slackEvents;

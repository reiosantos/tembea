import SlackNotifications from '../SlackPrompts/Notifications';
import ManagerNotifications from '../SlackPrompts/notifications/ManagerRouteRequest/index';
import { SlackEvents, slackEventNames } from './slackEvents';
import OperationsNotifications from '../SlackPrompts/notifications/OperationsRouteRequest';
import RouteNotifications from '../SlackPrompts/notifications/RouteNotifications';
import JoinRouteNotifications from '../RouteManagement/JoinRoute/JoinRouteNotifications';
import TripNotifications from '../SlackPrompts/notifications/TripNotifications';
import ProviderNotifications from '../SlackPrompts/notifications/ProviderNotifications';

const slackEvents = SlackEvents;

slackEvents.handle(slackEventNames.TRIP_APPROVED,
  SlackNotifications.sendOperationsTripRequestNotification);

slackEvents.handle(slackEventNames.TRIP_WAITING_CONFIRMATION,
  SlackNotifications.sendRequesterApprovedNotification);

slackEvents.handle(slackEventNames.RECEIVE_NEW_ROUTE_REQUEST,
  SlackNotifications.sendOperationsNewRouteRequest);

slackEvents.handle(slackEventNames.NEW_TRIP_REQUEST,
  SlackNotifications.sendManagerTripRequestNotification);

SlackEvents.handle(slackEventNames.NEW_TRIP_REQUEST,
  SlackNotifications.sendOpsTripRequestNotification);

slackEvents.handle(slackEventNames.DECLINED_TRIP_REQUEST,
  SlackNotifications.sendRequesterDeclinedNotification);

slackEvents.handle(slackEventNames.NEW_TRAVEL_TRIP_REQUEST,
  SlackNotifications.sendOperationsTripRequestNotification);

slackEvents.handle(slackEventNames.NEW_ROUTE_REQUEST,
  ManagerNotifications.sendManagerNotification);

slackEvents.handle(slackEventNames.MANAGER_DECLINED_ROUTE_REQUEST,
  ManagerNotifications.sendManagerDeclineMessageToFellow);

slackEvents.handle(slackEventNames.MANAGER_APPROVED_ROUTE_REQUEST,
  ManagerNotifications.sendManagerApproval);

slackEvents.handle(slackEventNames.OPERATIONS_DECLINE_ROUTE_REQUEST,
  OperationsNotifications.sendOpsDeclineMessageToFellow);

slackEvents.handle(slackEventNames.NOTIFY_ROUTE_RIDERS,
  RouteNotifications.sendRouteNotificationToRouteRiders);

SlackEvents.handle(slackEventNames.MANAGER_RECEIVE_JOIN_ROUTE,
  JoinRouteNotifications.sendManagerJoinRequest);

SlackEvents.handle(slackEventNames.OPS_FILLED_CAPACITY_ROUTE_REQUEST,
  JoinRouteNotifications.sendFilledCapacityJoinRequest);

SlackEvents.handle(slackEventNames.TRIP_COMPLETION,
  TripNotifications.sendCompletionNotification);

SlackEvents.handle(slackEventNames.RIDERS_CONFIRM_ROUTE_USE,
  RouteNotifications.sendRouteUseConfirmationNotificationToRider);

SlackEvents.handle(slackEventNames.RIDER_CANCEL_TRIP,
  SlackNotifications.sendManagerCancelNotification);

SlackEvents.handle(slackEventNames.NOTIFY_OPS_CANCELLED_TRIP,
  SlackNotifications.sendOpsCancelNotification);

SlackEvents.handle(slackEventNames.SEND_PROVIDER_APPROVED_ROUTE_REQUEST,
  ProviderNotifications.sendRouteRequestNotification);

export default slackEvents;

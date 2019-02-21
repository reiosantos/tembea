import SlackNotifications from '../SlackPrompts/Notifications';
import ManagerNotifications from '../SlackPrompts/notifications/ManagerRouteRequest/index';
import { SlackEvents, slackEventNames } from './slackEvents';
import OperationsNotifications from '../SlackPrompts/notifications/OperationsRouteRequest';
import RouteNotifications from '../SlackPrompts/notifications/RouteNotifications';
import JoinRouteNotifications from '../RouteManagement/JoinRoute/JoinRouteNotifications';

const slackEvents = SlackEvents;

slackEvents.handle(slackEventNames.TRIP_APPROVED,
  SlackNotifications.sendOperationsTripRequestNotification);

slackEvents.handle(slackEventNames.TRIP_WAITING_CONFIRMATION,
  SlackNotifications.sendRequesterApprovedNotification);

slackEvents.handle(slackEventNames.RECEIVE_NEW_ROUTE_REQUEST,
  SlackNotifications.sendOperationsNewRouteRequest);

slackEvents.handle(slackEventNames.NEW_TRIP_REQUEST,
  SlackNotifications.sendManagerTripRequestNotification);

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

slackEvents.handle(slackEventNames.APPROVE_ROUTE_REQUEST,
  OperationsNotifications.sendOpsApproveMessageToFellow);

SlackEvents.handle(slackEventNames.MANAGER_RECEIVE_JOIN_ROUTE,
  JoinRouteNotifications.sendManagerJoinRequest);

SlackEvents.handle(slackEventNames.OPS_FILLED_CAPACITY_ROUTE_REQUEST,
  JoinRouteNotifications.sendFilledCapacityJoinRequest);

export default slackEvents;

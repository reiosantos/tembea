import { EventEmitter } from 'events';

const eventsEmitter = new EventEmitter();

export const slackEventNames = Object.freeze({
  TRIP_APPROVED: 'trip_approved',
  TRIP_WAITING_CONFIRMATION: 'trip_waiting_confirmation',
  NEW_TRIP_REQUEST: 'new_trip_request',
  DECLINED_TRIP_REQUEST: 'declined_trip_request',
  NEW_TRAVEL_TRIP_REQUEST: 'new_travel_trip_request',
  NEW_ROUTE_REQUEST: 'new_route_request',
  MANAGER_DECLINED_ROUTE_REQUEST: 'manager_declined_route_request',
  MANAGER_APPROVED_ROUTE_REQUEST: 'manager_approved_route_request',
  RECEIVE_NEW_ROUTE_REQUEST: 'receive_new_route_request',
  OPERATIONS_DECLINE_ROUTE_REQUEST: 'operations_decline_route_request',
  NOTIFY_ROUTE_RIDERS: 'notify_route_riders',
  UPDATE_ROUTE_DRIVER: 'update_route_driver',
  MANAGER_RECEIVE_JOIN_ROUTE: 'manager_receive_join_route',
  OPS_FILLED_CAPACITY_ROUTE_REQUEST: 'ops_filled_capacity_route_request',
  TRIP_COMPLETION: 'trip_completion',
  RIDERS_CONFIRM_ROUTE_USE: 'riders_confirm_route_use',
  RIDER_CANCEL_TRIP: 'rider_cancel_trip',
  NOTIFY_OPS_CANCELLED_TRIP: 'notify_ops_cancelled_trip',
  SEND_PROVIDER_APPROVED_ROUTE_REQUEST: 'send_provider_approved_route_request',
  SEND_PROVIDER_VEHICLE_REMOVAL_NOTIFICATION: 'send_provider_vehicle_removal_notification',
  SEND_PROVIDER_CREATED_ROUTE_REQUEST: 'send_provider_created_route_request',
  COMPLETE_ROUTE_APPROVAL: 'complete_route_approval'
});

export class SlackEvents {
  static raise(eventName, ...args) {
    eventsEmitter.emit(eventName, ...args);
  }

  static handle(eventName, handler) {
    eventsEmitter.on(eventName, handler);
  }
}

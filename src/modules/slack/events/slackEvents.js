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
  APPROVE_ROUTE_REQUEST: 'approved_route_request'
});

export class SlackEvents {
  static raise(eventName, ...args) {
    eventsEmitter.emit(eventName, ...args);
  }

  static handle(eventName, handler) {
    eventsEmitter.on(eventName, handler);
  }
}

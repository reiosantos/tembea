import { EventEmitter } from 'events';

export const slackEventsNames = Object.freeze({
  TRIP_APPROVED: 'trip_approved',
  TRIP_WAITING_CONFIRMATION: 'trip_waiting_confirmation',
  NEW_TRIP_REQUEST: 'new_trip_request',
  DECLINED_TRIP_REQUEST: 'declined_trip_request'
});

const eventsEmitter = new EventEmitter();
export class SlackEvents {
  static raise(eventName, ...args) {
    eventsEmitter.emit(eventName, ...args);
  }

  static handle(eventName, handler) {
    eventsEmitter.on(eventName, handler);
  }
}

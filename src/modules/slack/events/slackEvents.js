import { EventEmitter } from 'events';

export const slackEventNames = Object.freeze({
  NEW_TRIP_REQUEST: 'new_trip_request',
  DECLINED_TRIP_REQUEST: 'declined_trip_request'
});

const eventsEmitter = new EventEmitter();
export class SlackEvents {
  static raise(eventName, ...args) {
    eventsEmitter.emit(eventName, ...args);
  }

  static handle(eventName, handle) {
    eventsEmitter.on(eventName, handle);
  }

  static addListener(eventName, listener) {
    eventsEmitter.addListener(eventName, listener);
  }
}

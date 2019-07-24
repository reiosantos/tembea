export default class CustomSlackRouter {
  constructor() {
    this.routes = new Map();
  }

  static createKey(blockId, actionId) {
    const key = `__${blockId || 'block'}__${actionId || 'action'}`;
    return key;
  }

  static getKey(payload) {
    const actionId = payload.actions[0].action_id;
    if (actionId.includes('userTripActions.getDepartment_')
      || actionId === 'user_trip_select_pickup_location'
      || actionId === 'user_trip_select_destination_location') {
      return CustomSlackRouter
        .createKey(payload.actions[0].block_id);
    }
    return CustomSlackRouter
      .createKey(payload.actions[0].block_id, payload.actions[0].action_id);
  }

  handle(payload, respond, next) {
    const key = CustomSlackRouter.getKey(payload);
    const handler = this.routes.get(key);
    if (handler) return handler(payload, respond);
    if (next) next();
  }

  use(routeOptions, handler) {
    this.routes.set(CustomSlackRouter
      .createKey(routeOptions.blockId, routeOptions.actionId), handler);
  }
}

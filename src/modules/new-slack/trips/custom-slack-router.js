export default class CustomSlackRouter {
  constructor() {
    this.routes = new Map();
  }

  static createKey(blockId, actionId) {
    const key = `__${blockId || 'block'}__${actionId || 'action'}`;
    return key;
  }

  handle(payload, respond) {
    const actionId = payload.actions[0].action_id;
    const blockId = payload.actions[0].block_id;
    const actionKey = CustomSlackRouter.createKey(blockId, actionId);
    const blockKey = CustomSlackRouter.createKey(blockId);
    const handler = this.routes.get(actionKey) || this.routes.get(blockKey);
    if (handler) return handler(payload, respond);
  }

  use(routeOptions, handler) {
    this.routes.set(CustomSlackRouter
      .createKey(routeOptions.blockId, routeOptions.actionId), handler);
  }
}

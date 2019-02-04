import SlackInteractions from './index';

const handleActions = (payload, respond, inputHandlers) => {
  const [,, callBackName] = payload.callback_id.split('_');
  const routeHandler = inputHandlers[callBackName];
  if (routeHandler) {
    return routeHandler(payload, respond);
  }
  respond(SlackInteractions.goodByeMessage());
};

export default handleActions;

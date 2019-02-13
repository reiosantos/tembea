import SlackInteractions from './index';
import { getAction } from '../RouteManagement/rootFile';

const handleActions = (payload, respond, inputHandlers) => {
  const callBackName = getAction(payload, 'actions');
  const routeHandler = inputHandlers[callBackName];
  if (routeHandler) {
    return routeHandler(payload, respond);
  }
  respond(SlackInteractions.goodByeMessage());
};

export default handleActions;

import { getAction } from '../RouteManagement/rootFile';
import SlackInteractionsHelpers from '../helpers/slackHelpers/SlackInteractionsHelpers';

const handleActions = (payload, respond, inputHandlers) => {
  const callBackName = getAction(payload, 'actions');
  const routeHandler = inputHandlers[callBackName];
  if (routeHandler) {
    return routeHandler(payload, respond);
  }
  respond(SlackInteractionsHelpers.goodByeMessage());
};

export default handleActions;

import { SlackInteractiveMessage } from '../../SlackModels/SlackMessageModels';
import { bugsnagHelper, SlackEvents, slackEventNames } from '../rootFile';
import JoinRouteDialogPrompts from './JoinRouteDialogPrompts';
import JoinRouteNotifications from './JoinRouteNotifications';
import JoinRouteHelpers from './JoinRouteHelpers';
import FormValidators from './JoinRouteFormValidators';
import JoinRouteInteractions from './JoinRouteInteractions';
import SlackInteractions from '../../SlackInteractions';


class JoinRouteInputHandlers {
  static async routeSelected(payload, respond) {
    try {
      const { actions: [{ value }] } = payload;
      respond(new SlackInteractiveMessage('Noted...'));
      await JoinRouteDialogPrompts.sendFellowDetailsForm(payload, value);
    } catch (error) {
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
      bugsnagHelper.log(error);
    }
  }

  static async fellowDetails(payload, respond) {
    try {
      const errors = FormValidators.validateFellowDetailsForm(payload);
      if (errors.length > 0) {
        return { errors };
      }
      await JoinRouteNotifications.sendFellowDetailsPreview(payload, respond);
    } catch (error) {
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
      bugsnagHelper.log(error);
    }
  }

  static async submitJoinRoute(payload, respond) {
    const { actions: [{ value }], user: { id } } = payload;
    if (value === 'confirmButton') {
      const joinRouteRequest = await JoinRouteHelpers.saveJoinRouteRequest(payload);
      if (joinRouteRequest) {
        respond(new SlackInteractiveMessage(
          `Hey <@${id}> :smiley:, your request has been received and will be responded to shortly.`
        ));
        SlackEvents.raise(slackEventNames.MANAGER_RECEIVE_JOIN_ROUTE, payload, joinRouteRequest.id);
      } else {
        respond(new SlackInteractiveMessage(
          `Hey <@${id}> :pensive:, your request was unsuccessful. Kindly Try again.`
        ));
      }
    }
  }

  static async backButton(payload, respond) {
    const { actions: [{ value }] } = payload;
    if (value === 'back') {
      return JoinRouteInteractions.sendAvailableRoutesMessage(payload, respond);
    }
    respond(SlackInteractions.goodByeMessage());
  }
}
export default JoinRouteInputHandlers;

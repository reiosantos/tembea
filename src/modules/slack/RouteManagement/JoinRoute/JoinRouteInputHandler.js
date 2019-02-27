import { SlackInteractiveMessage } from '../../SlackModels/SlackMessageModels';
import { bugsnagHelper, SlackEvents, slackEventNames } from '../rootFile';
import JoinRouteDialogPrompts from './JoinRouteDialogPrompts';
import JoinRouteNotifications from './JoinRouteNotifications';
import JoinRouteHelpers from './JoinRouteHelpers';
import FormValidators from './JoinRouteFormValidators';
import JoinRouteInteractions from './JoinRouteInteractions';
import SlackInteractions from '../../SlackInteractions';
import RouteService from '../../../../services/RouteService';

class JoinRouteInputHandlers {
  static async joinRoute(payload, respond) {
    try {
      const {
        actions: [{ value: routeId }]
      } = payload;
      const route = await RouteService.getRoute(routeId);
      if (RouteService.canJoinRoute(route)) {
        const state = JSON.stringify({ routeId, capacityFilled: false });
        JoinRouteDialogPrompts.sendFellowDetailsForm(payload, state);
        respond(new SlackInteractiveMessage('Noted'));
      } else {
        const notice = JoinRouteInteractions.fullRouteCapacityNotice(route.id);
        respond(notice);
      }
    } catch (error) {
      bugsnagHelper.log(error);
      respond(
        new SlackInteractiveMessage('Unsuccessful request. Kindly Try again')
      );
    }
  }

  static async continueJoinRoute(payload, respond) {
    const {
      actions: [{ value: routeId }]
    } = payload;
    const state = JSON.stringify({ routeId, capacityFilled: true });
    JoinRouteDialogPrompts.sendFellowDetailsForm(payload, state);
    respond(new SlackInteractiveMessage('Noted'));
  }

  static async fellowDetails(payload, respond) {
    try {
      const errors = FormValidators.validateFellowDetailsForm(payload);
      if (errors.length > 0) {
        return { errors };
      }
      const preview = await JoinRouteNotifications.sendFellowDetailsPreview(
        payload
      );
      respond(preview);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(
        new SlackInteractiveMessage('Unsuccessful request. Kindly Try again')
      );
    }
  }

  static async submitJoinRoute(payload, respond) {
    try {
      const {
        actions: [{ value }],
        user: { id },
        team: { id: teamId }
      } = payload;
      const { routeId, capacityFilled } = JSON.parse(value);
      let more = '';
      let eventArgs;
      if (capacityFilled) {
        more = ' Someone from the Ops team will reach out to you shortly.';
        eventArgs = [
          slackEventNames.OPS_FILLED_CAPACITY_ROUTE_REQUEST,
          { routeId, teamId, requesterSlackId: id }
        ];
      } else {
        const joinRouteRequest = await JoinRouteHelpers.saveJoinRouteRequest(
          payload,
          routeId
        );
        eventArgs = [
          slackEventNames.MANAGER_RECEIVE_JOIN_ROUTE,
          payload,
          joinRouteRequest.id
        ];
      }
      respond(
        new SlackInteractiveMessage(
          `Hey <@${id}> :smiley:, request has been received.${more}`
        )
      );
      SlackEvents.raise(...eventArgs);
    } catch (e) {
      // TODO: refactor code to ensure awareness about the error
    }
  }

  static async showAvailableRoutes(payload, respond) {
    await JoinRouteInteractions.sendAvailableRoutesMessage(payload, respond);
  }

  static async backButton(payload, respond) {
    const {
      actions: [{ value }]
    } = payload;
    if (value === 'back') {
      return JoinRouteInteractions.sendAvailableRoutesMessage(payload, respond);
    }
    respond(SlackInteractions.goodByeMessage());
  }
}
export default JoinRouteInputHandlers;

import { SlackInteractiveMessage } from '../../SlackModels/SlackMessageModels';
import {
  bugsnagHelper, SlackEvents, slackEventNames
} from '../rootFile';
import JoinRouteDialogPrompts from './JoinRouteDialogPrompts';
import JoinRouteNotifications from './JoinRouteNotifications';
import JoinRouteHelpers from './JoinRouteHelpers';
import FormValidators from './JoinRouteFormValidators';
import JoinRouteInteractions from './JoinRouteInteractions';
import SlackInteractions from '../../SlackInteractions';
import RouteService from '../../../../services/RouteService';
import { getFellowEngagementDetails } from '../../helpers/formHelper';
import UserService from '../../../../services/UserService';
import JoinRouteRequestService from '../../../../services/JoinRouteRequestService';
import PartnerService from '../../../../services/PartnerService';
import RemoveDataValues from '../../../../helpers/removeDataValues';
import ConfirmRouteUseJob from '../../../../services/jobScheduler/jobs/ConfirmRouteUseJob';

class JoinRouteInputHandlers {
  static async joinRoute(payload, respond) {
    try {
      const {
        actions: [{ value: routeId }], user: { id: userId }
      } = payload;
      const [engagement, route] = await Promise.all([
        getFellowEngagementDetails(userId, payload.team.id),
        RouteService.getRoute(routeId)]);
      const user = await UserService.getUserBySlackId(userId);


      if (!JoinRouteInputHandlers.joinRouteHandleRestrictions(user, route, engagement, respond)) {
        return;
      }

      if (RouteService.canJoinRoute(route)) {
        const state = JSON.stringify({ routeId, capacityFilled: false });
        JoinRouteDialogPrompts.sendFellowDetailsForm(payload, state, engagement);
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

  static joinRouteHandleRestrictions(user, route, engagement, respond) {
    if (!engagement) {
      respond(new SlackInteractiveMessage(
        `Sorry! It appears you are not on any engagement at the moment.
        If you believe this is incorrect, contact Tembea Support.`
      ));
      return false;
    }
    const hasJoinAnyRoute = route.riders
      .filter(users => users.slackId === user.slackId);

    if (hasJoinAnyRoute.length || user.routeBatchId) {
      respond(new SlackInteractiveMessage(
        'You are already on a route. Cannot join another'
      ));
      return false;
    }
    return true;
  }

  static async continueJoinRoute(payload, respond) {
    const {
      actions: [{ value: routeId }]
    } = payload;
    const engagement = await getFellowEngagementDetails(payload.user.id, payload.team.id);
    if (!engagement) {
      respond(new SlackInteractiveMessage(
        `Sorry! It appears you are not on any engagement at the moment.
        If you believe this is incorrect, contact Tembea Support.`
      ));
      return;
    }
    const state = JSON.stringify({ routeId, capacityFilled: true });
    JoinRouteDialogPrompts.sendFellowDetailsForm(payload, state, engagement);
    respond(new SlackInteractiveMessage('Noted'));
  }

  static async fellowDetails(payload, respond) {
    try {
      const errors = await FormValidators.validateFellowDetailsForm(payload);
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
        const { id: joinId, dataValues: { engagementId } } = await JoinRouteHelpers.saveJoinRouteRequest(
          payload,
          routeId
        );

        await JoinRouteRequestService.updateJoinRouteRequest(joinId, {
          status: 'Confirmed',
        });
        const user = await UserService.getUserBySlackId(id);
        const engagement = await getFellowEngagementDetails(id, teamId);
        const { startDate, endDate } = engagement;
        await PartnerService.updateEngagement(engagementId, { startDate, endDate });

        await RouteService.addUserToRoute(
          routeId, user.id
        );
        const route = await RouteService.getRoute(routeId);
        ConfirmRouteUseJob.scheduleBatchStartJob(RemoveDataValues.removeDataValues(route));
        eventArgs = [
          slackEventNames.MANAGER_RECEIVE_JOIN_ROUTE,
          payload,
          joinId
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

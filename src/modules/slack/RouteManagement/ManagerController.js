import moment from 'moment';
import DialogPrompts from '../SlackPrompts/DialogPrompts';
import bugsnagHelper from '../../../helpers/bugsnagHelper';
import { SlackInteractiveMessage } from '../SlackModels/SlackMessageModels';
import RouteRequestService from '../../../services/RouteRequestService';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';
import TeamDetailsService from '../../../services/TeamDetailsService';
import { slackEventNames, SlackEvents } from '../events/slackEvents';
import ManagerNotifications from '../SlackPrompts/notifications/ManagerRouteRequest/index';
import PartnerService from '../../../services/PartnerService';
import DateDialogHelper from '../../../helpers/dateHelper';
import AttachmentHelper from '../SlackPrompts/notifications/ManagerRouteRequest/helper';
import ManagerFormValidator from '../../../helpers/slack/UserInputValidator/managerFormValidator';
import { getAction } from './rootFile';

export const handleStatusValidationError = async (payload, routeRequest) => {
  const { channel: { id: channelId }, original_message: { ts } } = payload;
  const { team: { id: { teamId } } } = payload;
  const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
  await ManagerNotifications.completeManagerAction(routeRequest, channelId, ts, slackBotOauthToken);
};

export const convertIsoString = (engagementDate) => {
  let { startDate, endDate } = engagementDate;
  const sanitizedSD = DateDialogHelper.changeDateTimeFormat(startDate);
  const sanitizedED = DateDialogHelper.changeDateTimeFormat(endDate);
  startDate = moment(sanitizedSD, 'MM-DD-YYYY')
    .toISOString();
  endDate = moment(sanitizedED, 'MM-DD-YYYY')
    .toISOString();
  return {
    startDate,
    endDate
  };
};

const handlers = {
  initialNotification: async (payload) => {
    const { channel: { id: channelId }, original_message: { ts: timestamp }, actions } = payload;
    const { team: { id: teamId } } = payload;
    const [{ value }] = actions;
    const { data: { routeRequestId } } = JSON.parse(value);
    const {
      slackBotOauthToken, routeRequest
    } = await RouteRequestService.getRouteRequestAndToken(routeRequestId, teamId);

    const attachments = AttachmentHelper.getManagerMessageAttachment(routeRequest);

    const { fellow } = routeRequest.engagement;
    await InteractivePrompts.messageUpdate(
      channelId,
      `Hey, <@${fellow.slackId}> just requested to create a new route. :smiley:`,
      timestamp,
      attachments,
      slackBotOauthToken
    );
  },
  decline: async (payload) => {
    const { actions, channel: { id: channelId }, original_message: { ts: timeStamp } } = payload;
    const [{ value: routeRequestId }] = actions;
    const routeRequest = await RouteRequestService.getRouteRequest(routeRequestId);
    if (!ManagerFormValidator.validateStatus(routeRequest, 'pending')) {
      await handleStatusValidationError(payload, routeRequest);
      return;
    }
    const state = {
      decline: {
        timeStamp,
        channelId,
        routeRequestId
      }
    };
    DialogPrompts.sendReasonDialog(payload,
      'manager_route_declinedRequest',
      JSON.stringify(state), 'Decline', 'Decline', 'declineReason');
  },
  approve: async (payload) => {
    const { actions, channel: { id: channelId }, original_message: { ts: timeStamp } } = payload;
    const [{ value: routeRequestId }] = actions;
    const routeRequest = await RouteRequestService.getRouteRequest(routeRequestId);
    if (!ManagerFormValidator.validateStatus(routeRequest, 'pending')) {
      await handleStatusValidationError(payload, routeRequest);
      return;
    }
    const state = {
      approve: {
        timeStamp,
        channelId,
        routeRequestId
      }
    };
    DialogPrompts.sendEngagementInfoDialogToManager(
      payload, 'manager_route_approvedRequestPreview', JSON.stringify(state)
    );
  },
  declinedRequest: async (payload) => {
    const { submission: { declineReason }, team: { id: teamId } } = payload;
    const errors = ManagerFormValidator.validateReasons(declineReason, 'declineReason');
    if (errors.length > 0) {
      return { errors };
    }
    const { decline } = JSON.parse(payload.state);
    const { timeStamp, channelId, routeRequestId } = decline;
    const {
      slackBotOauthToken, routeRequest
    } = await RouteRequestService.getRouteRequestAndToken(routeRequestId, teamId);
    const updatedRequest = await RouteRequestService.updateRouteRequest(routeRequest.id, {
      status: 'Declined',
      managerComment: declineReason
    });

    SlackEvents.raise(
      slackEventNames.MANAGER_DECLINED_ROUTE_REQUEST,
      {
        routeRequestId: routeRequest.id,
        teamId
      }
    );
    await ManagerNotifications.completeManagerAction(
      updatedRequest, channelId, timeStamp, slackBotOauthToken
    );
  },
  approvedRequestPreview: async (payload) => {
    const { submission: { startDate, endDate }, team: { id: teamId } } = payload;
    const sanitizedSD = DateDialogHelper.changeDateTimeFormat(startDate);
    const sanitizedED = DateDialogHelper.changeDateTimeFormat(endDate);
    const errors = ManagerFormValidator.validateEngagementDate(sanitizedSD, sanitizedED);
    if (errors.length > 0) {
      return { errors };
    }
    const { approve } = JSON.parse(payload.state);
    const { timeStamp, channelId, routeRequestId } = approve;
    const {
      slackBotOauthToken, routeRequest
    } = await RouteRequestService.getRouteRequestAndToken(routeRequestId, teamId);
    const previewAttachment = AttachmentHelper.managerPreviewAttachment(
      routeRequest, { approve, startDate, endDate }
    );

    await InteractivePrompts.messageUpdate(
      channelId,
      '',
      timeStamp,
      [previewAttachment],
      slackBotOauthToken
    );
  },
  approvedRequestEdit: async (payload) => {
    const { actions } = payload;
    const [{ value }] = actions;
    const { startDate, endDate, approve } = JSON.parse(value);
    const state = { approve };
    DialogPrompts.sendEngagementInfoDialogToManager(
      payload, 'manager_route_approvedRequestPreview', JSON.stringify(state), {
        startDate,
        endDate
      }
    );
  },
  approvedRequestSubmit: async (payload, respond) => {
    const { actions, team: { id: teamId } } = payload;
    const [{ value: state }] = actions;
    const { approve, ...engagementDate } = JSON.parse(state);
    const { timeStamp, channelId, routeRequestId } = approve;
    const { startDate, endDate } = convertIsoString(engagementDate);

    const {
      slackBotOauthToken, routeRequest
    } = await RouteRequestService.getRouteRequestAndToken(routeRequestId, teamId);

    const { engagement } = routeRequest;
    await PartnerService.updateEngagement(engagement.id, { startDate, endDate });
    const updatedRequest = await RouteRequestService.updateRouteRequest(routeRequest.id, {
      status: 'Confirmed',
    });

    SlackEvents.raise(
      slackEventNames.MANAGER_APPROVED_ROUTE_REQUEST, payload, respond, { routeRequestId, teamId }
    );
    await ManagerNotifications.completeManagerAction(
      updatedRequest, channelId, timeStamp, slackBotOauthToken
    );
  },
};

export default class ManagerController {
  static managerRouteController(action) {
    return handlers[action]
      || (() => {
        throw new Error(`Unknown action: manager_route_${action}`);
      });
  }

  static async handleManagerActions(payload, respond) {
    try {
      const action = getAction(payload, 'btnActions');
      return ManagerController.managerRouteController(action)(payload, respond);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Error:bangbang:: I was unable to do that.'));
    }
  }
}

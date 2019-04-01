import JoinRouteHelpers from './JoinRouteHelpers';
import { SlackButtonAction, SlackInteractiveMessage } from '../../SlackModels/SlackMessageModels';
import createNavButtons from '../../../../helpers/slack/navButtons';
import TeamDetailsService from '../../../../services/TeamDetailsService';
import SlackNotifications from '../../SlackPrompts/Notifications';
import Cache from '../../../../cache';
import RouteService from '../../../../services/RouteService';
import JoinRouteRequestService from '../../../../services/JoinRouteRequestService';
import SlackHelpers from '../../../../helpers/slack/slackHelpers';
import { convertIsoString } from '../ManagerController';

class JoinRouteNotifications {
  static async sendFellowDetailsPreview(payload) {
    const { user: { id: slackId }, submission, team: { id: teamId } } = payload;
    const { routeId } = JSON.parse(payload.state);
    const tempJoinRoute = await JoinRouteNotifications.generateJoinRouteFromSubmission(
      submission, routeId, slackId, teamId
    );
    const attachment = JoinRouteHelpers.joinRouteAttachments(tempJoinRoute);
    const confirmButton = new SlackButtonAction(
      'submitJoinRoute', 'Confirm details', payload.state
    );
    attachment.addFieldsOrActions('actions', [confirmButton]);
    attachment.addOptionalProps('join_route_actions', undefined, '#4285f4');
    const navAttachment = createNavButtons('join_route_showAvailableRoutes', 'back_to_routes');
    return new SlackInteractiveMessage(
      '*Please confirm these details*', [attachment, navAttachment]
    );
  }

  static async generateJoinRouteFromSubmission(submission, id, slackId, teamId) {
    const {
      manager: managerID, partnerName, workHours, ...engagementDate
    } = submission;
    const { startDate, endDate } = convertIsoString(engagementDate);
    const [routeBatch, fellow, manager] = await Promise.all([
      RouteService.getRoute(id),
      SlackHelpers.findOrCreateUserBySlackId(slackId, teamId),
      SlackHelpers.findOrCreateUserBySlackId(managerID, teamId),
      await Cache.saveObject(`joinRouteRequestSubmission_${slackId}`, submission)
    ]);
    return {
      manager,
      routeBatch,
      engagement: {
        fellow,
        partner: { name: partnerName },
        workHours,
        startDate,
        endDate
      }
    };
  }

  static async sendManagerJoinRequest(payload, joinRequestId) {
    const {
      user: { id: slackId },
      team: { id: teamId },
    } = payload;
    const joinRoute = await JoinRouteRequestService.getJoinRouteRequest(joinRequestId);
    const attachment = JoinRouteHelpers.joinRouteAttachments(joinRoute);
    attachment.addOptionalProps('join_route_managerActions');
    const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
    const successOpsChannel = process.env.SUCCESS_OPS_CHANNEL;
    SlackNotifications.sendNotifications(
      successOpsChannel,
      attachment,
      `Hey :simple_smile: <@${slackId}> has joined a route`,
      slackBotOauthToken
    );
  }

  static async sendFilledCapacityJoinRequest(data) {
    const { routeId, teamId, requesterSlackId } = data;

    const {
      ...joinRouteRequestSubmission
    } = await Cache.fetch(`joinRouteRequestSubmission_${requesterSlackId}`);

    const tempJoinRoute = await JoinRouteNotifications.generateJoinRouteFromSubmission(
      joinRouteRequestSubmission, routeId, requesterSlackId, teamId
    );
    const attachments = JoinRouteHelpers.joinRouteAttachments(tempJoinRoute);

    const text = `Hey, <@${requesterSlackId}> tried to join a route that's already filled up.`;
    const teamDetails = await TeamDetailsService.getTeamDetails(teamId);
    const { botToken, opsChannelId } = teamDetails;

    SlackNotifications.sendNotifications(
      opsChannelId,
      attachments,
      text,
      botToken
    );
  }
}

export default JoinRouteNotifications;

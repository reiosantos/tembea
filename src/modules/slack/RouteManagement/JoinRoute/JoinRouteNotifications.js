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
import CleanData from '../../../../helpers/cleanData';

class JoinRouteNotifications {
  static async sendFellowDetailsPreview(payload) {
    const { user: { id: slackId }, submission, team: { id: teamId } } = payload;
    const result = await Cache.fetch(`userDetails${slackId}`);
    const engagementObject = {
      startDate: result[0],
      endDate: result[1],
      partnerName: result[2]
    };
    const { routeId } = JSON.parse(payload.state);
    const tempJoinRoute = await JoinRouteNotifications.generateJoinRouteFromSubmission(
      submission, routeId, slackId, teamId, engagementObject
    );
    const attachment = await JoinRouteHelpers.joinRouteAttachments(tempJoinRoute);
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

  static async generateJoinRouteFromSubmission(submission, id, slackId, teamId, engagement) {
    const {
      manager: managerID, workHours
    } = submission;
    const engagementDates = {
      startDate: engagement.startDate, endDate: engagement.endDate
    };
    const { startDate, endDate } = convertIsoString(engagementDates);
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
        partner: { name: engagement.partnerName },
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
    } = CleanData.trim(payload);
    const joinRoute = await JoinRouteRequestService.getJoinRouteRequest(joinRequestId);
    const attachment = await JoinRouteHelpers.joinRouteAttachments(joinRoute);
    attachment.addOptionalProps('join_route_managerActions');
    const { botToken, opsChannelId } = await TeamDetailsService.getTeamDetails(teamId);
    SlackNotifications.sendNotifications(
      opsChannelId,
      attachment,
      `Hey :simple_smile: <@${slackId}> has joined a route`,
      botToken
    );
  }

  static async sendFilledCapacityJoinRequest(data) {
    const { routeId, teamId, requesterSlackId } = data;

    const {
      ...joinRouteRequestSubmission
    } = await Cache.fetch(`joinRouteRequestSubmission_${requesterSlackId}`);
    const result = await Cache.fetch(`userDetails${requesterSlackId}`);
    const dateObject = {
      startDate: result[0],
      endDate: result[1],
      partnerName: result[2]
    };
    const tempJoinRoute = await JoinRouteNotifications.generateJoinRouteFromSubmission(
      joinRouteRequestSubmission, routeId, requesterSlackId, teamId, dateObject
    );
    const attachments = await JoinRouteHelpers.joinRouteAttachments(tempJoinRoute);

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

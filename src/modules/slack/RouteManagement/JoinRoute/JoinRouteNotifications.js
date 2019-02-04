import JoinRouteHelpers from './JoinRouteHelpers';
import { SlackButtonAction, SlackInteractiveMessage } from '../../SlackModels/SlackMessageModels';
import createNavButtons from '../../../../helpers/slack/navButtons';
import TeamDetailsService from '../../../../services/TeamDetailsService';
import SlackNotifications from '../../SlackPrompts/Notifications';

class JoinRouteNotifications {
  static async sendFellowDetailsPreview(payload, respond) {
    const { callback_id: callbackId } = payload;
    const routeBatchId = callbackId.split('_')[3];
    const attachment = await JoinRouteHelpers.joinRouteAttachments(payload);
    const confirmButton = new SlackButtonAction('submit', 'Confirm details', 'confirmButton');
    attachment.addFieldsOrActions('actions', [confirmButton]);
    attachment.addOptionalProps(`join_route_submitJoinRoute_${routeBatchId}`, undefined, '#4285f4');
    const navAttachment = createNavButtons('join_route_backButton', 'back');
    const message = new SlackInteractiveMessage(
      '*Please confirm these details*', [attachment, navAttachment]
    );
    respond(message);
  }

  static async sendManagerJoinRequest(payload, joinRequestId) {
    const {
      user: { id: slackId },
      team: { id: teamId },
    } = payload;
    const attachment = await JoinRouteHelpers.joinRouteAttachments(payload, joinRequestId);
    const approveButton = new SlackButtonAction('approve', 'Approve', joinRequestId);
    const declineButton = new SlackButtonAction('decline', 'Decline', joinRequestId, 'danger');
    attachment.addFieldsOrActions('actions', [approveButton, declineButton]);
    attachment.addOptionalProps('join_route_managerActions', undefined, '#4285f4');
    const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
    const successOpsChannel = process.env.SUCCESS_OPS_CHANNEL;
    SlackNotifications.sendNotifications(
      successOpsChannel,
      attachment,
      `Hey :simple_smile: <@${slackId}> requested a new route`,
      slackBotOauthToken
    );
  }
}

export default JoinRouteNotifications;

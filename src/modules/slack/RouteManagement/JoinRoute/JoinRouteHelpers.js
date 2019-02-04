import Utils from '../../../../utils/index';
import RouteService from '../../../../services/RouteService';
import JoinRouteRequestService from '../../../../services/JoinRouteRequestService';
import Cache from '../../../../cache';
import PartnerService from '../../../../services/PartnerService';
import SlackHelpers from '../../../../helpers/slack/slackHelpers';
import { SlackAttachmentField, SlackAttachment } from '../../SlackModels/SlackMessageModels';


class JoinRouteHelpers {
  static getName(username) {
    let names = username.split('.');
    names = names.map(name => Utils.toSentenceCase(name));
    return names.join(' ');
  }

  static async getRouteBatch(payload) {
    const { callback_id: callbackId } = payload;
    const [,,, routeBatchId] = callbackId.split('_');
    return RouteService.getRouteBatchByPk(routeBatchId);
  }

  static async saveJoinRouteRequest(payload) {
    const { user: { id: slackId }, team: { id: teamId } } = payload;
    const {
      manager, partnerName, workHours, startDate, endDate
    } = await Cache.fetch(`joinRouteRequestSubmission_${slackId}`);
    const [partner, fellow, managerInfo, routeBatch] = await Promise.all(
      [
        PartnerService.findOrCreatePartner(partnerName),
        SlackHelpers.findOrCreateUserBySlackId(slackId, teamId),
        SlackHelpers.findOrCreateUserBySlackId(manager, teamId),
        this.getRouteBatch(payload)
      ]
    );
    const engagement = await PartnerService.findOrCreateEngagement(
      workHours, fellow, partner, startDate, endDate
    );
    const joinRouteRequest = await JoinRouteRequestService.createJoinRouteRequest(
      engagement.id, managerInfo.id, routeBatch.id
    );
    return joinRouteRequest;
  }

  static async getJoinRouteRequest({ id, submission, slackId }) {
    let manager;
    let workHours;
    let startDate;
    let endDate;
    let partnerName;
    if (submission) {
      ({
        manager, partnerName, workHours, startDate, endDate
      } = submission);
      await Cache.saveObject(`joinRouteRequestSubmission_${slackId}`, submission);
    } else {
      ({
        manager: { slackId: manager },
        engagement: {
          workHours, startDate, endDate, partner: { name: partnerName }
        }
      } = await JoinRouteRequestService.getJoinRouteRequest(id));
    }
    return {
      manager, workHours, startDate, endDate, partnerName
    };
  }

  static async engagementFields(payload, joinRequestId) {
    const { submission, user: { id: slackId, name } } = payload;
    const {
      manager, partnerName, workHours, startDate, endDate
    } = await this.getJoinRouteRequest({ id: joinRequestId, submission, slackId });
    const { from, to } = Utils.formatWorkHours(workHours);
    const fellowName = this.getName(name) || `<@${slackId}>`;
    return [
      new SlackAttachmentField('Fellow Name', fellowName, true),
      new SlackAttachmentField('Partner', partnerName, true),
      new SlackAttachmentField('Line Manager', `<@${manager}>`),
      new SlackAttachmentField('Work Hours', null, false),
      new SlackAttachmentField('_From_', from, true),
      new SlackAttachmentField('To', to, true),
      new SlackAttachmentField('Engagement dates', null, false),
      new SlackAttachmentField('_Start_', startDate, true),
      new SlackAttachmentField('_End_', endDate, true)
    ];
  }

  static async routeFields(route) {
    const {
      capacity, riders, takeOff,
      route: { name: routeName, destination: { address } }
    } = route;
    const departureTime = Utils.formatTime(takeOff);
    return [
      new SlackAttachmentField('Route', routeName, true),
      new SlackAttachmentField('Route capacity', `${riders.length}/${capacity}`, true),
      new SlackAttachmentField('Route Departure Time', departureTime, false),
      new SlackAttachmentField('Bus Stop :busstop:', address, false),
    ];
  }

  static async joinRouteAttachments(payload, joinRequestId = null) {
    const routeBatch = await this.getRouteBatch(payload);
    const { route: { imageUrl: routeImageUrl } } = routeBatch;
    const attachment = new SlackAttachment(undefined, undefined,
      undefined, undefined, routeImageUrl);
    const fellowFields = await JoinRouteHelpers.engagementFields(payload, joinRequestId);
    const routeBatchFields = await JoinRouteHelpers.routeFields(routeBatch);
    const separator = '---------------------';
    const attachments = [
      new SlackAttachmentField(`${separator}${separator}${separator}`, null, false),
      new SlackAttachmentField('*_`Engagement Details`_*', null, false),
      ...fellowFields,
      new SlackAttachmentField(`${separator}${separator}${separator}`, null, false),
      new SlackAttachmentField('*_`Route Information`_*', null, false),
      ...routeBatchFields,
      new SlackAttachmentField(`${separator}${separator}${separator}`, null, false),
    ];
    attachment.addFieldsOrActions('fields', attachments);
    return attachment;
  }
}

export default JoinRouteHelpers;

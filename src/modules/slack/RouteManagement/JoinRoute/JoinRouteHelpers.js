import Utils from '../../../../utils/index';
import JoinRouteRequestService from '../../../../services/JoinRouteRequestService';
import Cache from '../../../../cache';
import PartnerService from '../../../../services/PartnerService';
import SlackHelpers from '../../../../helpers/slack/slackHelpers';
import { SlackAttachmentField, SlackAttachment } from '../../SlackModels/SlackMessageModels';
import AttachmentHelper from '../../SlackPrompts/notifications/AttachmentHelper';
import { convertIsoString } from '../ManagerController';
import RouteService from '../../../../services/RouteService';

class JoinRouteHelpers {
  static getName(username) {
    let names = username.split('.');
    names = names.map(name => Utils.toSentenceCase(name));
    return names.join(' ');
  }

  static async saveJoinRouteRequest(payload, routeBatchId) {
    const { user: { id: slackId }, team: { id: teamId } } = payload;
    const {
      manager: managerSlackId, partnerName, workHours, ...engagementDate
    } = await Cache.fetch(`joinRouteRequestSubmission_${slackId}`);

    const { startDate, endDate } = convertIsoString(engagementDate);
    const [partner, fellow, manager, routeBatch] = await Promise.all([
      PartnerService.findOrCreatePartner(partnerName),
      SlackHelpers.findOrCreateUserBySlackId(slackId, teamId),
      SlackHelpers.findOrCreateUserBySlackId(managerSlackId),
      RouteService.getRoute(routeBatchId)
    ]);

    const engagement = await PartnerService.findOrCreateEngagement(
      workHours, fellow, partner, startDate, endDate
    );

    return JoinRouteRequestService.createJoinRouteRequest(
      engagement.id, manager.id, routeBatch.id
    );
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

  static engagementFields(joinRequest) {
    const { manager: { slackId, email, name } } = joinRequest;
    const managerName = Utils.getNameFromEmail(email) || name;
    const managerField = new SlackAttachmentField('Line Manager', `${managerName} (<@${slackId}>)`);
    const fields = AttachmentHelper.engagementAttachmentFields(joinRequest);
    fields.splice(2, 0, managerField);
    return fields;
  }

  static routeFields(route) {
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

  static joinRouteAttachments(joinRoute) {
    const { routeBatch, routeBatch: { route: { imageUrl } } } = joinRoute;
    const attachment = new SlackAttachment(undefined, undefined,
      undefined, undefined, imageUrl);
    const fellowFields = JoinRouteHelpers.engagementFields(joinRoute);
    const routeBatchFields = JoinRouteHelpers.routeFields(routeBatch);
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
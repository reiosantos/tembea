import createNavButtons from '../../../helpers/slack/navButtons';
import {
  SlackAttachment,
  SlackAttachmentField,
  SlackButtonAction,
  SlackCancelButtonAction,
  SlackInteractiveMessage,
} from '../SlackModels/SlackMessageModels';
import AttachmentHelper from './notifications/AttachmentHelper';

class PreviewPrompts {
  static async sendPartnerInfoPreview(payload, result, fellow) {
    const routeRequest = PreviewPrompts.generateRouteModelFromCacheDate(
      result, { ...payload.submission, nameOfPartner: payload.partnerName, fellow }
    );
    const { routeImageUrl } = routeRequest;
    const attachment = new SlackAttachment('', '', '', '', routeImageUrl);
    const engagementAttachment = await AttachmentHelper.engagementAttachmentFields(routeRequest);
    const manager = new SlackAttachmentField('Manager', `<@${routeRequest.manager.slackId}>`);
    engagementAttachment.splice(2, 0, manager);
    const addressDetailAttachment = AttachmentHelper.routeAttachmentFields(routeRequest);
    const cancellationText = 'Are you sure you want to cancel this trip request';
    const actions = [
      new SlackButtonAction('confirmNewRouteRequest', 'Confirm', JSON.stringify(payload)),
      new SlackCancelButtonAction('Cancel', 'cancel', cancellationText, 'cancel_new_request')
    ];
    attachment.addFieldsOrActions('actions', actions);
    attachment.addFieldsOrActions('fields', [...engagementAttachment, ...addressDetailAttachment]);
    attachment.addOptionalProps('new_route_handlePartnerForm', 'fallback', undefined, 'default');
    return new SlackInteractiveMessage('*Preview Details*', [
      attachment
    ]);
  }

  static generateEngagementModel(engagementInfo) {
    if (!engagementInfo) return {};
    const {
      manager: managerId, nameOfPartner, workingHours: workHours, fellow
    } = engagementInfo;
    return {
      manager: { slackId: managerId },
      engagement: { partner: { name: nameOfPartner }, workHours, fellow }
    };
  }

  static generateRouteModelFromCacheDate(previewData, engagementInfo) {
    const {
      staticMapUrl, homeToDropOffDistance, dojoToDropOffDistance, savedBusStop, savedHomeAddress,
    } = previewData;
    let { distanceInMetres: busStopDistance } = homeToDropOffDistance;
    let { distanceInMetres: distance } = dojoToDropOffDistance;
    busStopDistance = Math.ceil(busStopDistance / 1000).toFixed(1);
    distance = Math.ceil(distance / 1000).toFixed(1);
    const engagement = PreviewPrompts.generateEngagementModel(engagementInfo);
    return {
      busStopDistance,
      distance,
      ...engagement,
      busStop: savedBusStop,
      home: savedHomeAddress,
      routeImageUrl: staticMapUrl
    };
  }

  static displayDestinationPreview(previewData) {
    const routeRequest = PreviewPrompts.generateRouteModelFromCacheDate(previewData);
    const { routeImageUrl } = routeRequest;
    const title = 'A preview of your location and selected bus stop :smile:';
    const attachment = new SlackAttachment('', title, '', '', routeImageUrl);

    attachment.addFieldsOrActions('fields', AttachmentHelper.routeAttachmentFields(routeRequest));
    attachment.addFieldsOrActions('actions', [
      new SlackButtonAction('launchNewRoutePrompt', 'Continue', 'launchNewRoutePrompt')]);

    attachment.addOptionalProps('new_route_handleNewRouteRequest');

    const navAttachment = createNavButtons('back_to_launch', 'back_to_routes_launch');

    return new SlackInteractiveMessage('*Map Preview*', [attachment, navAttachment]);
  }
}

export default PreviewPrompts;

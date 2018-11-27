import WebClientSingleton from '../../../utils/WebClientSingleton';
import DataHelper from '../../../helpers/dataHelpers';
import {
  SlackAttachmentField,
  SlackAttachment,
  SlackButtonAction
} from '../SlackModels/SlackMessageModels';
import dateHelper from '../../../helpers/utils/index';

const web = new WebClientSingleton();

class SlackNotifications {
  static async sendManagerTripRequestNotification(tripInformation, respond) {
    try {
      const head = await DataHelper.getHeadByDepartmentId(tripInformation.departmentId);
      const requester = await DataHelper.getUserById(tripInformation.requestedById);
      const newTripRequest = await DataHelper.getTripRequest(tripInformation.id);

      const pickup = newTripRequest.origin.dataValues.address;
      const destination = newTripRequest.destination.dataValues.address;

      const imResponse = await web.getWebClient().im.open({
        user: head.slackId
      });

      const attachments = new SlackAttachment('New Trip Request');
      attachments.addOptionalProps('manager_action', '/fallback', '#3359DF');
      const fields = SlackNotifications.notificationFields(pickup,
        destination,
        newTripRequest);
      const actions = SlackNotifications.notificationActions(newTripRequest);
      attachments.addFieldsOrActions('fields', fields);
      attachments.addFieldsOrActions('actions', actions);

      return SlackNotifications.sendNotification(imResponse, attachments,
        `Hey, <@${requester.slackId}> has just booked a trip. :smiley:`);
    } catch (error) {
      respond({
        text: 'Error:warning:: Request saved, but I could not send a notification to your manager.'
      });
    }
  }

  static sendNotification(imResponse, attachments, text) {
    return web.getWebClient().chat.postMessage({
      channel: imResponse.channel.id,
      text,
      attachments: [
        attachments
      ]
    });
  }

  static async sendRequesterDeclinedNotification(tripInformation, respond) {
    try {
      const requester = await DataHelper.getUserById(tripInformation.requestedById);
      const decliner = await DataHelper.getUserById(tripInformation.declinedById);
      const pickup = tripInformation.origin.dataValues.address;
      const destination = tripInformation.destination.dataValues.address;

      const attachments = new SlackAttachment('Declined Trip Request');
      attachments.addOptionalProps('', '/fallback', '#3359DF');
      const fields = SlackNotifications.notificationFields(pickup,
        destination,
        tripInformation);
      fields.push(new SlackAttachmentField('Reason', tripInformation.managerComment, false));
      attachments.addFieldsOrActions('fields', fields);

      const imResponse = await web.getWebClient().im.open({
        user: requester.slackId
      });

      return SlackNotifications.sendNotification(imResponse, attachments,
        `Sorry, <@${decliner.slackId}> has just declined your trip. :disappointed:`);
    } catch (error) {
      respond({
        text: 'Error:warning:: Decline saved but requester will not get the notification'
      });
    }
  }

  static notificationActions(tripInformation) {
    return [
      new SlackButtonAction('manager_decline', 'Decline', tripInformation.id, 'danger')
    ];
  }

  static notificationFields(pickup, destination, tripInformation) {
    return [
      new SlackAttachmentField('Pickup Location', pickup, true),
      new SlackAttachmentField('Destination', destination, true),
      new SlackAttachmentField('Request Date',
        dateHelper.formatDate(tripInformation.createdAt), true),
      new SlackAttachmentField('Trip Date',
        dateHelper.formatDate(tripInformation.departureTime), true)
    ];
  }
}

export default SlackNotifications;

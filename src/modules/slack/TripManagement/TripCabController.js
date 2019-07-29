import {
  SlackAttachment, SlackButtonAction, SlackInteractiveMessage
} from '../SlackModels/SlackMessageModels';
import SlackInteractions from '../SlackInteractions/index';
import bugsnagHelper from '../../../helpers/bugsnagHelper';

class TripCabController {
  static sendCreateCabAttachment(payload, callbackId, routeRequestData) {
    try {
      const state = JSON.parse(payload.state);
      state.confirmationComment = payload.submission.confirmationComment;
      state.routeRequestData = routeRequestData;
      const attachment = new SlackAttachment();
      attachment.addFieldsOrActions('actions', [
        new SlackButtonAction('confirmTrip', 'Proceed', JSON.stringify(state))]);
      attachment.addOptionalProps(callbackId);
      const result = new SlackInteractiveMessage('*Proceed to Create New Cab*', [attachment]);
      return result;
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

  /**
   * Handles trip dialog form submission (providers assignment)
   *
   * @static
   * @param {Object} data - The request payload
   * @param {Object} respond - The response object
   * @returns {void}
   * @memberof TripCabController
   */
  static async handleSelectProviderDialogSubmission(data, respond) {
    const { submission: { provider } } = data;
    const providerDetails = provider.split(',');
    const [providerName, providerUserId, providerUserSlackId, providerId] = providerDetails;
    const modifiedProviderData = {
      ...data,
      submission: {
        ...data.submission,
        providerName,
        providerUserId,
        providerUserSlackId,
        providerId
      }
    };
    await SlackInteractions.handleTripActions(modifiedProviderData, respond);
  }
}

export default TripCabController;

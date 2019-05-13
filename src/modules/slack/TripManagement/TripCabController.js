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

  static async handleSelectCabDialogSubmission(data, respond) {
    const { submission } = data;
    if (submission.cab === 'Create New Cab') {
      const result = TripCabController.sendCreateCabAttachment(data, 'operations_approval_trip', null);
      respond(result);
      return;
    }
    const {
      submission: {
        cab
      }
    } = data;
    const cabDetails = cab.split(',');
    const [driverName, driverPhoneNo, regNumber] = cabDetails;
    const modifiedCabData = { ...data };
    modifiedCabData.submission = {
      ...data.submission,
      driverName,
      driverPhoneNo,
      regNumber
    };
    await SlackInteractions.handleTripActions(modifiedCabData, respond);
  }
}

export default TripCabController;

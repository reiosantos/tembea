import {
  SlackAttachment, SlackButtonAction, SlackInteractiveMessage
} from '../SlackModels/SlackMessageModels';
import SlackInteractions from '../SlackInteractions/index';
import { bugsnagHelper } from '../RouteManagement/rootFile';

class TripCabController {
  static sendCreateCabAttachment(payload, respond) {
    try {
      const state = JSON.parse(payload.state);
      state.confirmationComment = payload.submission.confirmationComment;
      const attachment = new SlackAttachment();
      attachment.addFieldsOrActions('actions', [
        new SlackButtonAction('confirmTrip', 'Proceed', JSON.stringify(state))]);
      attachment.addOptionalProps('operations_approval');
      const message = new SlackInteractiveMessage('*Proceed to Create New Cab*', [attachment]);
      respond(message);
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

  static async handleSelectCabDialogSubmission(data, respond) {
    const { submission } = data;
    if (submission.cab === 'Create New Cab') {
      TripCabController.sendCreateCabAttachment(data, respond);
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
